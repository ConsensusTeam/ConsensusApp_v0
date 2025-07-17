import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get comments for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user?.userId;

    const comments = await prisma.comment.findMany({
      where: { questionId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
        likes: userId ? {
          where: {
            userId,
          },
        } : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform comments to include isLiked
    const transformedComments = comments.map(comment => ({
      ...comment,
      isLiked: comment.likes?.length > 0,
      likes: undefined, // Remove the likes array from the response
    }));

    res.json(transformedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Create a comment
router.post('/question/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    const comment = await prisma.comment.create({
      data: {
        content,
        questionId,
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    res.status(201).json({
      ...comment,
      isLiked: false,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
});

// Like/unlike a comment
router.post('/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    // Check if like exists
    const existingLike = await prisma.like.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      // Like
      await prisma.like.create({
        data: {
          commentId,
          userId,
        },
      });
    }

    res.json({ message: existingLike ? 'Comment unliked' : 'Comment liked' });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like' });
  }
});

export default router; 