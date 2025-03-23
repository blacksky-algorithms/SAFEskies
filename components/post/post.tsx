import React from 'react';
import { AppBskyRichtextFacet } from '@atproto/api';
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

import { PostFooter } from './components/post-footer';
import { PostHeader } from './components/post-header';
import { PostText } from './components/post-text';
import { EmbedRenderer } from './components/embed-renderer';
import { Icon } from '@/components/icon';
import cc from 'classcat';

interface TextRecord {
  text: string;
  facets?: AppBskyRichtextFacet.Main[];
}

interface PostProps {
  post: PostView;
  parentPost?: PostView | null;
  rootPost?: PostView | null;
  onModAction: (post: PostView) => void;
  showModMenu: boolean;
  isSignedIn: boolean;
}

export const Post = ({
  post,
  parentPost,
  rootPost,
  onModAction,
  showModMenu,
  isSignedIn,
}: PostProps) => {
  const renderThreadPost = (postData: PostView | null, id: string) => {
    if (!postData) return <div>Post Deleted</div>;
    const { author, embed, indexedAt, record } = postData;
    const textRecord = record as TextRecord;

    return (
      <article
        id={id}
        aria-labelledby={`${id}-header`}
        role='region'
        className={cc([
          'bg-app-background p-3 border-l border-r border-t border-gray-800 shadow-sm w-full mx-auto max-w-screen',
        ])}
      >
        <PostHeader
          author={author}
          postIndexedAt={indexedAt}
          id={`${id}-header`}
        />
        {textRecord?.text && (
          <PostText text={textRecord.text} facets={textRecord.facets} />
        )}
        <EmbedRenderer
          content={embed}
          labels={postData.labels}
          isSignedIn={isSignedIn}
        />
      </article>
    );
  };
  const parentOrRootPost = parentPost || rootPost;

  return (
    <div className='w-full flex flex-col'>
      {/* Render root and parent posts */}
      {rootPost && renderThreadPost(rootPost, 'root-post')}
      {parentPost &&
        parentPost.uri !== rootPost?.uri &&
        renderThreadPost(parentPost, 'parent-post')}

      {/* Replying to message before the current post */}
      <article
        role='region'
        aria-describedby={parentPost ? 'parent-post' : undefined}
        className={cc([
          'border-l border-r border-b border-gray-800 shadow-sm w-full mx-auto max-w-screen',

          {
            'px-3': !parentPost && !rootPost,
            'px-10': parentOrRootPost,
            'border-b-none': parentOrRootPost,
          },
        ])}
      >
        <div className='py-3 shadow'>
          <PostHeader author={post.author} postIndexedAt={post.indexedAt} />
          {parentOrRootPost && (
            <div className='flex items-center space-x-2 justify-start text-gray-400 text-sm'>
              <Icon size='sm' icon='ArrowUturnLeftIcon' />
              <span id='reply-info' className='text-gray-400'>
                Reply to{' '}
                <span className='text-gray-200 semi-bold'>
                  {parentOrRootPost.author
                    ? `@${
                        parentOrRootPost.author.displayName ||
                        parentOrRootPost.author.handle
                      }`
                    : 'Deleted Post'}
                </span>
              </span>
            </div>
          )}
          {(post.record as TextRecord)?.text && (
            <PostText text={(post.record as TextRecord).text} />
          )}
          <EmbedRenderer
            content={post.embed}
            labels={post.labels}
            isSignedIn={isSignedIn}
          />
        </div>
        <PostFooter
          showModMenu={showModMenu}
          post={post}
          onModAction={onModAction}
        />
      </article>
    </div>
  );
};
