// src/controllers/contract.controller.js
import Contract from "./Contract.js";

export const getContracts = async (req, res) => {
  const data = await Contract.find()
    .populate("user_id")
    .populate("room_id");

  res.json(data);
};

export const createContract = async (req, res) => {
  const contract = await Contract.create({
    ...req.body,
    status: "pending",
  });

  res.json(contract);
};

export const getMyContracts = async (req, res) => {
  const data = await Contract.find({ user_id: req.user.id })
    .populate("room_id");

  res.json(data);
};

export const updateContractStatus = async (req, res) => {
  const { id } = req.params;

  const contract = await Contract.findByIdAndUpdate(
    id,
    { status: req.body.status },
    { new: true }
  );

  res.json(contract);
};