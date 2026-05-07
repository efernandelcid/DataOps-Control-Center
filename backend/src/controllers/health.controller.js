export const getHealth = (req, res) => {
  res.json({
    status: "OK",
    message: "DataOps Control Center funcionando"
  });
};