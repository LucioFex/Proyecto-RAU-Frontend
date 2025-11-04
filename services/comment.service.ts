import { api } from './api';
import type { Comment, Post } from '../types';
import { postService } from './post.service';

export const commentService = {
  async createComment(
    postId: string,
    content: string,
    parentCommentId?: string
  ): Promise<{ comment: Comment; post: Post }> {
    const response = await api.post(`/posts/${postId}/comments`, {
      cuerpo: content,
      comentario_padre_id: parentCommentId || null,
    });

    return {
      comment: postService.mapComment(response.data.comment),
      post: postService.mapPost(response.data.post),
    };
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
  },
};
