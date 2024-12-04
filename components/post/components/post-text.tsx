import { AppBskyRichtextFacet } from '@atproto/api';
const renderTextSegment = (
  text: string,
  start: number,
  end: number,
  key: string
) => <span key={key}>{text.slice(start, end)}</span>;

const renderFacet = (
  facet: AppBskyRichtextFacet.Main,
  text: string,
  idx: number
) => {
  const { byteStart, byteEnd } = facet.index;
  const feature = facet.features[0];
  const content = text.slice(byteStart, byteEnd);

  if (AppBskyRichtextFacet.isTag(feature)) {
    return (
      <span key={`hashtag-${idx}`} className='text-theme-primary '>
        {content}
      </span>
    );
  }

  if (AppBskyRichtextFacet.isMention(feature)) {
    return (
      <span key={`mention-${idx}`} className='text-theme-primary'>
        {content}
      </span>
    );
  }
  if (AppBskyRichtextFacet.isLink(feature)) {
    <a
      key={`link-${idx}`}
      href={(feature as AppBskyRichtextFacet.Link).uri || undefined}
      target='_blank'
      rel='noopener noreferrer'
      className='text-theme-primary underline'
    >
      {content}
    </a>;
  }

  return null;
};

export const PostText = ({
  text = '',
  facets = [],
}: {
  text?: string;
  facets?: AppBskyRichtextFacet.Main[];
}) => {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  facets.forEach((facet, idx) => {
    const { byteStart } = facet.index;

    if (lastIndex < byteStart) {
      elements.push(
        renderTextSegment(text, lastIndex, byteStart, `text-${idx}`)
      );
    }

    elements.push(renderFacet(facet, text, idx));
    lastIndex = facet.index.byteEnd;
  });

  if (lastIndex < text.length) {
    elements.push(
      renderTextSegment(text, lastIndex, text.length, 'remaining-text')
    );
  }

  return <p className='p-4'>{elements}</p>;
};
