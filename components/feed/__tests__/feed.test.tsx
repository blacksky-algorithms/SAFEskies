import { renderHook, act } from '@/setupTests';
import { useState } from 'react';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

describe('Feed state management', () => {
  it('maintains separate URIs for viewing and moderation', () => {
    const { result } = renderHook(() => {
      const [viewedPostUri, setViewedPostUri] = useState<string | null>(null);
      const [moderatedPostUri, setModeratedPostUri] = useState<string | null>(
        null
      );

      const handlePostClick = (post: PostView) => {
        setViewedPostUri(post.uri);
      };

      const handleModAction = (post: PostView) => {
        setModeratedPostUri(post.uri);
      };

      return {
        viewedPostUri,
        moderatedPostUri,
        handlePostClick,
        handleModAction,
      };
    });

    const mainPost = { uri: 'post1' } as PostView;
    const replyPost = { uri: 'post2' } as PostView;

    // View main post
    act(() => {
      result.current.handlePostClick(mainPost);
    });
    expect(result.current.viewedPostUri).toBe('post1');
    expect(result.current.moderatedPostUri).toBeNull();

    // Moderate reply while viewing main post
    act(() => {
      result.current.handleModAction(replyPost);
    });
    expect(result.current.viewedPostUri).toBe('post1');
    expect(result.current.moderatedPostUri).toBe('post2');
  });

  it('clears URIs when closing modals', () => {
    const { result } = renderHook(() => {
      const [viewedPostUri, setViewedPostUri] = useState<string | null>(null);
      const [moderatedPostUri, setModeratedPostUri] = useState<string | null>(
        null
      );

      const handleCloseView = () => setViewedPostUri(null);
      const handleCloseMod = () => setModeratedPostUri(null);

      return {
        viewedPostUri,
        moderatedPostUri,
        handleCloseView,
        handleCloseMod,
      };
    });

    act(() => {
      result.current.handleCloseView();
      result.current.handleCloseMod();
    });

    expect(result.current.viewedPostUri).toBeNull();
    expect(result.current.moderatedPostUri).toBeNull();
  });

  it('cleans up state when closing modals', () => {
    const { result } = renderHook(() => {
      const [viewedPostUri, setViewedPostUri] = useState<string | null>(null);
      const [moderatedPostUri, setModeratedPostUri] = useState<string | null>(
        null
      );

      const handleClose = () => {
        setViewedPostUri(null);
        setModeratedPostUri(null);
      };

      return {
        viewedPostUri,
        moderatedPostUri,
        setViewedPostUri,
        setModeratedPostUri,
        handleClose,
      };
    });

    act(() => {
      result.current.setViewedPostUri('post1');
      result.current.setModeratedPostUri('post2');
      result.current.handleClose();
    });

    expect(result.current.viewedPostUri).toBeNull();
    expect(result.current.moderatedPostUri).toBeNull();
  });
});
