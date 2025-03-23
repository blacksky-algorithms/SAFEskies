import React, { useCallback } from 'react';
import { AppBskyRichtextFacet } from '@atproto/api';
import {
  isBlockedAuthor,
  isBlockedPost,
  PostView,
} from '@atproto/api/dist/client/types/app/bsky/feed/defs';

import { PostFooter } from './components/post-footer';
import { PostHeader } from './components/post-header';
import { PostText } from './components/post-text';
import { EmbedRenderer } from './components/embed-renderer';
import { Icon } from '@/components/icon';
import cc from 'classcat';
import { VisualIntent } from '@/enums/styles';

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
    if (!postData?.author)
      // Todo: refine this check to differentiate between deleted post and deleted account
      return (
        <div className='w-full align-items-center border border-gray-800 p-4 flex-row flex gap-2'>
          <Icon icon='InformationCircleIcon' intent={VisualIntent.Secondary} />
          <p>PostDeleted</p>
        </div>
      );
    if (isBlockedAuthor(postData) || isBlockedPost(postData))
      return (
        <div className='w-full align-items-center border border-gray-800 p-4 flex-row flex gap-2'>
          <Icon icon='InformationCircleIcon' intent={VisualIntent.Secondary} />
          <p>{isBlockedAuthor(postData) ? 'Blocked Author' : 'Blocked Post'}</p>
        </div>
      );
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

  const getReplyToText = useCallback(
    (data: PostView) => {
      let result = data.author
        ? `@${data.author.displayName || data.author.handle}`
        : 'Deleted Post';
      if (data.blocked) {
        result = isBlockedAuthor(data) ? 'Blocked Author' : 'Blocked Post';
      }
      return result;
    },
    [parentOrRootPost]
  );

  return (
    <div className='w-full flex flex-col'>
      {parentOrRootPost &&
        renderThreadPost(parentOrRootPost, 'parent-or-root-post')}

      {/* Replying to message before the current post */}
      <article
        role='region'
        aria-describedby={parentPost ? 'parent-post' : undefined}
        className={cc([
          'border-l border-r border-b border-gray-800 shadow-sm w-full mx-auto max-w-screen',

          {
            'px-3': !parentOrRootPost,
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
                  {getReplyToText(parentOrRootPost)}
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
