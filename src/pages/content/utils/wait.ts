const wait = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export default wait;
