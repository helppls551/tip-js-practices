export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });

    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}


function parseBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    throw new TypeError("baseUrl должен быть абсолютным URL");
  }

  let url;

  try {
    url = new URL(baseUrl);
  } catch {
    throw new TypeError("baseUrl должен быть абсолютным URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("Допустимы только http и https");
  }

  if (url.search || url.hash) {
    throw new TypeError("baseUrl не должен содержать query или hash");
  }

  return url;
}


// Создаёт URL и добавляет query-параметры.
export function buildUrl(baseUrl, path, query = {}) {
  const url = parseBaseUrl(baseUrl);

  if (typeof path !== "string" || path.trim() === "") {
    throw new TypeError("path должен быть непустой строкой");
  }

  if (query === null || typeof query !== "object" || Array.isArray(query)) {
    throw new TypeError("query должен быть объектом");
  }

  const basePath = url.pathname.replace(/\/+$/, "");
  const relativePath = path.trim().replace(/^\/+/, "");

  url.pathname = `${basePath}/${relativePath}`;

  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(name, String(value));
  }

  return url.toString();
}


export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  parseBaseUrl(baseUrl);

  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией");
  }

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым числом");
  }


  async function requestJson(path, {
    query = {},
    signal,
    timeoutMs: requestTimeoutMs = timeoutMs,
  } = {}) {
    if (
      !Number.isSafeInteger(requestTimeoutMs)
      || requestTimeoutMs <= 0
    ) {
      throw new TypeError("timeoutMs должен быть положительным целым числом");
    }

    if (signal !== undefined && !(signal instanceof AbortSignal)) {
      throw new TypeError("signal должен быть AbortSignal");
    }

    const url = buildUrl(baseUrl, path, query);

    const timeoutSignal = AbortSignal.timeout(requestTimeoutMs);

    const requestSignal = signal
      ? AbortSignal.any([signal, timeoutSignal])
      : timeoutSignal;

    let response;

    try {
      response = await fetchFn(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: requestSignal,
      });
    } catch (cause) {
      if (signal?.aborted) {
        throw new ApiError("Запрос отменён.", {
          kind: "aborted",
          url,
          cause,
        });
      }

      if (timeoutSignal.aborted) {
        throw new ApiError("Превышено время ожидания ответа.", {
          kind: "timeout",
          url,
          cause,
        });
      }

      throw new ApiError("Не удалось получить ответ от сервера.", {
        kind: "network",
        url,
        cause,
      });
    }


    if (!(response instanceof Response)) {
      throw new ApiError("Получен некорректный Response.", {
        kind: "invalid-response",
        url,
      });
    }


    // HTTP-ошибка
    if (!response.ok) {
      let payload = null;

      try {
        payload = await response.json();
      } catch {
        // Даже если JSON неправильный,
        // ошибка всё равно остаётся HTTP-ошибкой.
      }

      const apiError =
        payload
        && typeof payload === "object"
        && payload.error
        && typeof payload.error === "object"
          ? payload.error
          : null;

      const message =
        typeof apiError?.message === "string"
        && apiError.message.trim() !== ""
          ? apiError.message
          : `HTTP ${response.status}`;

      throw new ApiError(message, {
        kind: "http",
        status: response.status,
        code:
          typeof apiError?.code === "string"
            ? apiError.code
            : null,
        details:
          apiError?.details ?? null,
        url,
      });
    }


    // У 204 тела нет.
    if (response.status === 204) {
      return null;
    }


    const contentType =
      response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      throw new ApiError("Ожидался JSON-ответ.", {
        kind: "invalid-response",
        url,
      });
    }


    try {
      return await response.json();
    } catch (cause) {
      throw new ApiError("Не удалось разобрать JSON.", {
        kind: "invalid-response",
        url,
        cause,
      });
    }
  }


  return {
    requestJson,
  };
}