let timer: number | null = null;
let endTime: number = 0;

self.onmessage = (e: MessageEvent) => {
  const { command, duration } = e.data;

  if (command === "start") {
    clearInterval(timer!);
    endTime = Date.now() + duration * 1000;

    timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      (self as unknown as Worker).postMessage({ timeLeft: remaining });
      if (remaining <= 0) {
        clearInterval(timer!);
        (self as unknown as Worker).postMessage({ completed: true });
      }
    }, 1000);
  } else if (command === "stop") {
    clearInterval(timer!);
  }
};
