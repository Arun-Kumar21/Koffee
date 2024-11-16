import Document from "../model/Document";
import Room from "../model/Room";
import { Request, Response } from "express";


// @route POST /api/v1/document/create
// @desc Create a document

export const createDocument = async (req: any, res: Response) => {
    try {
        const { title, content, slug } = req.body;
        if (!title || !content || !slug) {
            return res.status(400).json({ message: "Please enter all fields" });
        }
        const document = await Document.create({
            title,
            content,
            slug,
            user: req.user._id
        });
        return res.status(201).json({
            message: "Document created successfully",
            data: document
        });
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
        
    }
}

// @route POST /api/v1/document/create/:id
// @desc Create a document for a room by id which allow to edit by members of the room

export const createDocumentForRoom = async (req: Request, res: Response) => {
    try {
        const { title, content, slug, user } = req.body;
        if (!title || !content || !slug) {
            return res.status(400).json({ message: "Please enter all fields" });
        }
        const document = await Document.create({
            title,
            content,
            slug,
            user
        });
        const room = await Room.findByIdAndUpdate(req.params.id, { $push: { document: document._id } }, { new: true });
        return res.status(201).json({
            message: "Document created successfully",
            data: document
        });
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
        
    }
}

// @route GET /api/v1/document/get
// @desc Get all documents

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const documents = await Document.find().populate("user");
        return res.status(200).json({
            data: documents
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
        
    }
}

// @route GET /api/v1/document/get/:id
// @desc Get a document by id

export const getDocument = async (req: Request, res: Response) => {
    try {
        console.log("req", req.socket);
        const document = await Document.findById(req.params.id).populate("user");
        return res.status(200).json({
            data: document
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
        
    }
}

// @route PUT /api/v1/document/update/:id
// @desc Update a document by id

export const updateDocument = async (req: Request, res: Response) => {
    try {
        const document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json({
            message: "Document updated successfully",
            data: document
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });

    }
}

// @route DELETE /api/v1/document/delete/:id
// @desc Delete a document by id

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        await Document.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            message: "Document deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });

    }
}
