import { Router } from 'express';
import { prisma } from '../db';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Get all questions (including inactive ones)
router.get('/questions', adminAuth, async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            answers: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create a new question
router.post('/questions', adminAuth, async (req, res) => {
  try {
    const { title, content, options, startDate, endDate } = req.body;
    
    const question = await prisma.question.create({
      data: {
        title,
        content,
        options,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        authorId: req.user!.userId,
        isActive: false
      }
    });
    
    res.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update a question
router.put('/questions/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, options, startDate, endDate, isActive } = req.body;
    
    const question = await prisma.question.update({
      where: { id },
      data: {
        title,
        content,
        options,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive
      }
    });
    
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete a question
router.delete('/questions/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.question.delete({
      where: { id }
    });
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router; 