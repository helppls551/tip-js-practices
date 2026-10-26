const baseUrl =
  "http://127.0.0.1:5505/api";


async function sequential() {
  const start = performance.now();

  await fetch(
    `${baseUrl}/debug/delay?ms=150`
  );

  await fetch(
    `${baseUrl}/debug/delay?ms=150`
  );

  return performance.now() - start;
}


async function parallel() {
  const start = performance.now();

  const first = fetch(
    `${baseUrl}/debug/delay?ms=150`
  );

  const second = fetch(
    `${baseUrl}/debug/delay?ms=150`
  );

  await Promise.all([
    first,
    second,
  ]);

  return performance.now() - start;
}


for (let i = 1; i <= 3; i += 1) {
  console.log(
    `Попытка ${i}:`
  );

  console.log(
    "Последовательно:",
    (await sequential()).toFixed(1),
    "мс"
  );

  console.log(
    "Параллельно:",
    (await parallel()).toFixed(1),
    "мс"
  );
}