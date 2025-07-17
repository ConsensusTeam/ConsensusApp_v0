import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requirePremium } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get today's question
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyQuestion = await prisma.question.findFirst({
      where: {
        isDaily: true,
        activeDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!dailyQuestion) {
      return res.status(404).json({ message: 'No daily question available' });
    }

    res.json(dailyQuestion);
  } catch (error) {
    console.error('Error fetching daily question:', error);
    res.status(500).json({ message: 'Error fetching daily question' });
  }
});

// Submit answer to daily question
router.post('/daily/answer', async (req, res) => {
  try {
    const { questionId, selectedOption, education, ageRange, region } = req.body;
    const userId = req.user?.userId;

    // Validate question exists and is daily
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        isDaily: true,
      },
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Create answer
    const answer = await prisma.answer.create({
      data: {
        questionId,
        userId,
        selectedOption,
        education,
        ageRange,
        region,
      },
    });

    // Get answer statistics
    const stats = await prisma.answer.groupBy({
      by: ['selectedOption'],
      where: {
        questionId,
      },
      _count: true,
    });

    res.status(201).json({
      answer,
      stats,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Error submitting answer' });
  }
});

// Create new question (premium only)
router.post('/', authenticateToken, requirePremium, async (req, res) => {
  try {
    const { title, options } = req.body;
    const userId = req.user!.userId;

    const question = await prisma.question.create({
      data: {
        title,
        options,
        authorId: userId,
      },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Error creating question' });
  }
});

// Get question statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await prisma.$transaction([
      // Overall statistics
      prisma.answer.groupBy({
        by: ['selectedOption'],
        where: { questionId: id },
        _count: true,
      }),
      // Statistics by education
      prisma.answer.groupBy({
        by: ['education', 'selectedOption'],
        where: { questionId: id },
        _count: true,
      }),
      // Statistics by age range
      prisma.answer.groupBy({
        by: ['ageRange', 'selectedOption'],
        where: { questionId: id },
        _count: true,
      }),
      // Statistics by region
      prisma.answer.groupBy({
        by: ['region', 'selectedOption'],
        where: { questionId: id },
        _count: true,
      }),
    ]);

    res.json({
      overall: stats[0],
      byEducation: stats[1],
      byAgeRange: stats[2],
      byRegion: stats[3],
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

export default router; 