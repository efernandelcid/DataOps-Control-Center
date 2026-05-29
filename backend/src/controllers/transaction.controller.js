import { registerTransactionLog } from "../services/transactionLog.service.js";

export const simulateTransaction = async (req, res) => {
  const inicio = new Date();
  const sessionId = `TX-${Date.now()}`;

  const waitTime = Math.floor(Math.random() * 500);

  await new Promise(resolve => setTimeout(resolve, waitTime));

  const fin = new Date();

  const lockTypes = ["SHARED", "EXCLUSIVE", "TIMEOUT", "DEADLOCK"];
  const lockType = lockTypes[Math.floor(Math.random() * lockTypes.length)];

  await registerTransactionLog({
    sessionId,
    operation: "UPDATE",
    inicio,
    fin,
    waitTime,
    lockType
  });

  res.json({
    session_id: sessionId,
    operation: "UPDATE",
    wait_time: waitTime,
    lock_type: lockType
  });
};