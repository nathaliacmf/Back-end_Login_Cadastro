import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Criar usuário
app.post('/usuarios', async (req, res) => {
    try {
        const { email, name, age } = req.body;

        if (!email || !name || age === undefined) {
            return res.status(400).json({ error: "Os campos 'email', 'name' e 'age' são obrigatórios." });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "E-mail já cadastrado." });
        }

        const newUser = await prisma.user.create({
            data: { email, name, age: Number(age) }
        });

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar usuário", details: error.message });
    }
});

app.get('/usuarios', async (req, res) => {
    try {
        let users = await prisma.user.findMany();

        // Converte qualquer valor errado de 'age' para um número válido
        users = users.map(user => ({
            ...user,
            age: Number(user.age) || 0  // Se age for inválido, define como 0
        }));

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuários", details: error.message });
    }
});


// Atualizar usuário
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { email, name, age } = req.body;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "ID inválido." });
        }

        if (!email || !name || age === undefined) {
            return res.status(400).json({ error: "Os campos 'email', 'name' e 'age' são obrigatórios." });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { email, name, age: Number(age) }
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar usuário", details: error.message });
    }
});

// Deletar usuário
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "ID inválido." });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        await prisma.user.delete({ where: { id } });
        res.status(200).json({ message: "Usuário deletado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar usuário", details: error.message });
    }
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
