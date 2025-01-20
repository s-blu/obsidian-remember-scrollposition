const isDebugEnabled = process?.env?.RESCROLLDEBUG;

export function logDebug(...args: unknown[]) {
  if (isDebugEnabled) {
    console.debug("ReScroll:", ...args);
  }
}
