import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Test endpoint to create a daily question
router.post('/test/create-daily', async (req, res) => {
  try {
    // Create a test user if not exists
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'test123', // In a real app, this should be hashed
          isAdmin: true,
          isPremium: true
        }
      });
    }

    // Create a daily question
    const question = await prisma.question.create({
      data: {
        title: "Today's Sample Question",
        content: "What's your favorite programming language?",
        options: ["JavaScript", "Python", "Java", "C++", "Other"],
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        authorId: testUser.id
      }
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating test question:', error);
    res.status(500).json({ message: 'Error creating test question' });
  }
});

// Get today's question
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyQuestion = await prisma.question.findFirst({
      where: {
        isActive: true,
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
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

// Check if user has already answered
router.get('/:questionId/check-answer', async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user?.userId;
    const deviceId = req.headers['x-device-id'] as string;

    if (!deviceId && !userId) {
      return res.status(400).json({ message: 'Device ID veya kullanıcı kimliği gerekli' });
    }

    const existingAnswer = await prisma.answer.findFirst({
      where: {
        questionId,
        OR: [
          { deviceId: { not: null, equals: deviceId } },
          { userId: { not: null, equals: userId } }
        ]
      }
    });

    if (existingAnswer) {
      // Get answer statistics
      const answers = await prisma.answer.groupBy({
        by: ['optionIndex'],
        where: { questionId },
        _count: true,
      });

      const total = answers.reduce((sum, a) => sum + a._count, 0);
      const stats = answers.map(a => ({
        optionIndex: a.optionIndex,
        count: a._count,
        percentage: (a._count / total) * 100
      }));

      return res.json({
        hasAnswered: true,
        stats
      });
    }

    res.json({ hasAnswered: false });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ message: 'Cevap kontrolü sırasında bir hata oluştu' });
  }
});

// Submit answer to daily question
router.post('/daily/answer', async (req, res) => {
  try {
    const { questionId, optionIndex, education, ageGroup, region } = req.body;
    const userId = req.user?.userId;
    const deviceId = req.headers['x-device-id'] as string;

    if (!deviceId && !userId) {
      return res.status(400).json({ message: 'Device ID veya kullanıcı kimliği gerekli' });
    }

    // Validate the question exists and is active
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        isActive: true,
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (!question) {
      return res.status(404).json({ message: 'Soru bulunamadı veya aktif değil' });
    }

    // Check for existing answer from this device or user
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        questionId,
        OR: [
          { deviceId: { not: null, equals: deviceId } },
          { userId: { not: null, equals: userId } }
        ]
      }
    });

    if (existingAnswer) {
      // Get answer statistics
      const answers = await prisma.answer.groupBy({
        by: ['optionIndex'],
        where: { questionId },
        _count: true,
      });

      const total = answers.reduce((sum, a) => sum + a._count, 0);
      const stats = answers.map(a => ({
        optionIndex: a.optionIndex,
        count: a._count,
        percentage: (a._count / total) * 100
      }));

      return res.status(409).json({
        message: 'Bu soruyu daha önce cevapladınız',
        stats
      });
    }

    // Create the answer
    await prisma.answer.create({
      data: {
        questionId,
        userId,
        deviceId,
        optionIndex,
        education,
        ageGroup,
        region,
      },
    });

    // Get updated statistics
    const answers = await prisma.answer.groupBy({
      by: ['optionIndex'],
      where: { questionId },
      _count: true,
    });

    const total = answers.reduce((sum, a) => sum + a._count, 0);
    const stats = answers.map(a => ({
      optionIndex: a.optionIndex,
      count: a._count,
      percentage: (a._count / total) * 100
    }));

    res.json({ stats });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Cevap gönderilirken bir hata oluştu' });
  }
});

// Create new question (premium only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, options } = req.body;
    const userId = req.user!.userId;

    const question = await prisma.question.create({
      data: {
        title,
        content,
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