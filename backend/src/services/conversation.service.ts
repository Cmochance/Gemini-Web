import prisma from './prisma.service';

interface ConversationData {
  userId: number;
  uuid: number;
  title?: string;
}

class ConversationService {
  async getAll(userId: number) {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    // Convert BigInt to string for JSON serialization
    return conversations.map(conv => ({
      ...conv,
      uuid: conv.uuid.toString(),
    }));
  }

  async create(data: ConversationData) {
    const conversation = await prisma.conversation.create({
      data: {
        userId: data.userId,
        uuid: data.uuid,
        title: data.title || 'New Chat',
      },
    });

    // Convert BigInt to string for JSON serialization
    return {
      ...conversation,
      uuid: conversation.uuid.toString(),
    };
  }

  async update(userId: number, uuid: number, title: string) {
    return await prisma.conversation.updateMany({
      where: { userId, uuid },
      data: { title, updatedAt: new Date() },
    });
  }

  async delete(userId: number, uuid: number) {
    return await prisma.conversation.deleteMany({
      where: { userId, uuid },
    });
  }
}

export default new ConversationService();
