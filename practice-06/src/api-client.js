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


const ALLOWED_METHODS = new Set([
  "GET",
  "POST",
  "PATCH",
  "DELETE",
]);


function parseBaseUrl(baseUrl) {
  if (
    typeof baseUrl !== "string"
    || baseUrl.trim() === ""
  ) {
    throw new TypeError(
      "baseUrl должен быть абсолютным URL"
    );
  }

  let url;

  try {
    url = new URL(baseUrl);
  } catch {
    throw new TypeError(
      "baseUrl должен быть абсолютным URL"
    );
  }

  if (
    url.protocol !== "http:"
    && url.protocol !== "https:"
  ) {
    throw new TypeError(
      "Допустимы только http и https"
    );
  }

  if (url.search || url.hash) {
    throw new TypeError(
      "baseUrl не должен содержать query или hash"
    );
  }

  return url;
}


export function buildUrl(
  baseUrl,
  path,
  query = {}
) {
  const url = parseBaseUrl(baseUrl);

  if (
    typeof path !== "string"
    || path.trim() === ""
  ) {
    throw new TypeError(
      "path должен быть непустой строкой"
    );
  }

  if (
    query === null
    || typeof query !== "object"
    || Array.isArray(query)
  ) {
    throw new TypeError(
      "query должен быть объектом"
    );
  }

  const basePath =
    url.pathname.replace(/\/+$/, "");

  const relativePath =
    path.trim().replace(/^\/+/, "");

  url.pathname =
    `${basePath}/${relativePath}`;

  for (
    const [name, value]
    of Object.entries(query)
  ) {
    if (
      value === undefined
      || value === null
      || value === ""
    ) {
      continue;
    }

    url.searchParams.set(
      name,
      String(value)
    );
  }

  return url.toString();
}


export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 3000,
} = {}) {
  parseBaseUrl(baseUrl);

  if (typeof fetchFn !== "function") {
    throw new TypeError(
      "fetchFn должен быть функцией"
    );
  }

  if (
    !Number.isSafeInteger(timeoutMs)
    || timeoutMs <= 0
  ) {
    throw new TypeError(
      "timeoutMs должен быть положительным целым числом"
    );
  }


  async function requestJson(
    path,
    {
      method = "GET",
      query = {},
      body,
      signal,
      timeoutMs: requestTimeoutMs = timeoutMs,
    } = {},
  ) {
    const normalizedMethod =
      String(method).toUpperCase();

    if (!ALLOWED_METHODS.has(normalizedMethod)) {
      throw new TypeError(
        `Неподдерживаемый HTTP-метод: ${method}`
      );
    }

    if (
      normalizedMethod === "GET"
      && body !== undefined
    ) {
      throw new TypeError(
        "GET-запрос не должен содержать body"
      );
    }

    if (
      !Number.isSafeInteger(requestTimeoutMs)
      || requestTimeoutMs <= 0
    ) {
      throw new TypeError(
        "timeoutMs должен быть положительным целым числом"
      );
    }

    if (
      signal !== undefined
      && !(signal instanceof AbortSignal)
    ) {
      throw new TypeError(
        "signal должен быть AbortSignal"
      );
    }


    const url =
      buildUrl(baseUrl, path, query);


    const timeoutSignal =
      AbortSignal.timeout(requestTimeoutMs);


    const requestSignal = signal
      ? AbortSignal.any([
          signal,
          timeoutSignal,
        ])
      : timeoutSignal;


    const headers = {
      Accept: "application/json",
    };


    const fetchOptions = {
      method: normalizedMethod,
      headers,
      signal: requestSignal,
    };


    if (body !== undefined) {
      headers["Content-Type"] =
        "application/json";

      fetchOptions.body =
        JSON.stringify(body);
    }


    let response;

    try {
      response =
        await fetchFn(
          url,
          fetchOptions
        );
    } catch (cause) {
      if (signal?.aborted) {
        throw new ApiError(
          "Запрос отменён.",
          {
            kind: "aborted",
            url,
            cause,
          },
        );
      }

      if (timeoutSignal.aborted) {
        throw new ApiError(
          "Превышено время ожидания ответа.",
          {
            kind: "timeout",
            url,
            cause,
          },
        );
      }

      throw new ApiError(
        "Не удалось получить ответ от сервера.",
        {
          kind: "network",
          url,
          cause,
        },
      );
    }


    if (!(response instanceof Response)) {
      throw new ApiError(
        "Получен некорректный HTTP-ответ.",
        {
          kind: "invalid-response",
          url,
        },
      );
    }


    if (!response.ok) {
      let payload = null;

      try {
        payload =
          await response.json();
      } catch {
        // HTTP-ошибка остаётся HTTP-ошибкой,
        // даже если тело не является JSON.
      }

      const errorData =
        payload
        && typeof payload === "object"
        && payload.error
        && typeof payload.error === "object"
          ? payload.error
          : null;


      const message =
        typeof errorData?.message === "string"
        && errorData.message.trim() !== ""
          ? errorData.message
          : `HTTP ${response.status}`;


      throw new ApiError(
        message,
        {
          kind: "http",
          status: response.status,
          code:
            typeof errorData?.code === "string"
              ? errorData.code
              : null,
          details:
            errorData?.details ?? null,
          url,
        },
      );
    }


    if (response.status === 204) {
      return null;
    }


    const contentType =
      response.headers.get(
        "content-type"
      ) ?? "";


    if (
      !contentType.includes(
        "application/json"
      )
    ) {
      throw new ApiError(
        "Ожидался JSON-ответ.",
        {
          kind: "invalid-response",
          url,
        },
      );
    }


    try {
      return await response.json();
    } catch (cause) {
      throw new ApiError(
        "Не удалось разобрать JSON.",
        {
          kind: "invalid-response",
          url,
          cause,
        },
      );
    }
  }


  return {
    requestJson,
  };
}