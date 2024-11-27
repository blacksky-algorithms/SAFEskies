fetching post

```typescript
import { useEffect } from 'react';
import { preferredLanguages } from '@/utils/todo';
import { AtpAgent } from '@atproto/api';

export const agent = new AtpAgent({
  // "at://did:plc:qzkrgc4ahglknwb7ymee4a6w/app.bsky.feed.generator/aaafstml2groe"
  // App View URL
  service: 'https://api.bsky.app',
  // If you were making an authenticated client, you would
  // use the PDS URL here instead - the main one is bsky.social
  // service: "https://bsky.social",
});

useEffect(() => {
  const getFeed = async () => {
    try {
      const { data } = await agent.app.bsky.feed.getFeed(
        {
          feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
          limit: 30,
        },
        {
          headers: {
            'Accept-Language': preferredLanguages,
          },
        }
      );
      const { feed } = data;
      // FeedListProps[]
      setPosts(feed);
    } catch (error) {
      console.error({ error });
      // TODO: Handle error
    }
  };
  getFeed();
}, []);
```

```typescript
// post has bsky imbed, the embedded post has an external embed:
{
    "post": {
        "uri": "at://did:plc:urqhs3esj4nlxcq55cdai5rn/app.bsky.feed.post/3lbv3urcj3s2t",
        "cid": "bafyreie5ipbmimqp7xdn4vy4ub766olmr6u5bpzlzltgscsyt7ue4smziq",
        "author": {
            "did": "did:plc:urqhs3esj4nlxcq55cdai5rn",
            "handle": "kelliteration.bsky.social",
            "displayName": "Kelliteration 👑 ♌️",
            "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:urqhs3esj4nlxcq55cdai5rn/bafkreif4emcdjpz5olrnudv6mcst3jo42ddop2jdfweuonvoxs4d33grsu@jpeg",
            "labels": [],
            "createdAt": "2024-11-13T03:20:36.682Z"
        },
        "record": {
            "$type": "app.bsky.feed.post",
            "createdAt": "2024-11-26T22:34:57.235Z",
            "embed": {
                "$type": "app.bsky.embed.record",
                "record": {
                    "cid": "bafyreicta5an4hqqyas22ljephb25prdy3zkr634oy4cwvsdmnyvdwbg6u",
                    "uri": "at://did:plc:jmte4w4x7ukciit6lci6ziau/app.bsky.feed.post/3lbujtl5sgk2a"
                }
            },
            "langs": [
                "en"
            ],
            "text": "He's opening himself up for a HARD fall. Really being the catalyst for your own demise is fuckin crazy!! But... PRIDE.... another song from Kendrick 😭😭😭"
        },
        "embed": {
            "$type": "app.bsky.embed.record#view",
            "record": {
                "$type": "app.bsky.embed.record#viewRecord",
                "uri": "at://did:plc:jmte4w4x7ukciit6lci6ziau/app.bsky.feed.post/3lbujtl5sgk2a",
                "cid": "bafyreicta5an4hqqyas22ljephb25prdy3zkr634oy4cwvsdmnyvdwbg6u",
                "author": {
                    "did": "did:plc:jmte4w4x7ukciit6lci6ziau",
                    "handle": "phillewis.bsky.social",
                    "displayName": "Phil Lewis",
                    "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:jmte4w4x7ukciit6lci6ziau/bafkreif5xhqmtujhof4uey7cczispl54swmm6tfw5ouvurkppjgnkj2nbq@jpeg",
                    "associated": {
                        "chat": {
                            "allowIncoming": "all"
                        }
                    },
                    "labels": [],
                    "createdAt": "2023-04-23T15:46:11.748Z"
                },
                "value": {
                    "$type": "app.bsky.feed.post",
                    "createdAt": "2024-11-26T17:12:09.883Z",
                    "embed": {
                        "$type": "app.bsky.embed.external",
                        "external": {
                            "description": "Drake has launched a second legal action against Universal Music Group over Kendrick Lamar’s “Not Like Us,” accusing the music giant of defamation.",
                            "thumb": {
                                "$type": "blob",
                                "ref": {
                                    "$link": "bafkreic66sriron52wzzwzmmdb67hf7cd6dnpl5ynhsl5vc3gmqlpg6544"
                                },
                                "mimeType": "image/jpeg",
                                "size": 352146
                            },
                            "title": "Drake Files Second Action Against UMG, Alleging Defamation Over Kendrick Lamar’s ‘False’ Song",
                            "uri": "https://www.billboard.com/pro/drake-second-legal-action-umg-iheart-pay-for-play-defamation/"
                        }
                    },
                    "langs": [
                        "en"
                    ],
                    "text": "Drake has launched a second legal action against UMG over Kendrick Lamar’s “Not Like Us,” accusing the music  giant of defamation and claiming it could have halted the release of a song “falsely accusing him of being a sex offender”"
                },
                "labels": [],
                "likeCount": 1800,
                "replyCount": 337,
                "repostCount": 389,
                "quoteCount": 2207,
                "indexedAt": "2024-11-26T17:12:11.854Z",
                "embeds": [
                    {
                        "$type": "app.bsky.embed.external#view",
                        "external": {
                            "uri": "https://www.billboard.com/pro/drake-second-legal-action-umg-iheart-pay-for-play-defamation/",
                            "title": "Drake Files Second Action Against UMG, Alleging Defamation Over Kendrick Lamar’s ‘False’ Song",
                            "description": "Drake has launched a second legal action against Universal Music Group over Kendrick Lamar’s “Not Like Us,” accusing the music giant of defamation.",
                            "thumb": "https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:jmte4w4x7ukciit6lci6ziau/bafkreic66sriron52wzzwzmmdb67hf7cd6dnpl5ynhsl5vc3gmqlpg6544@jpeg"
                        }
                    }
                ]
            }
        },
        "replyCount": 0,
        "repostCount": 1,
        "likeCount": 2,
        "quoteCount": 1,
        "indexedAt": "2024-11-26T22:34:57.961Z",
        "labels": []
    }

    const VARIETY_SAMPLE = [
    {
        "post": {
            "uri": "at://did:plc:4hsqiyuogfohtw5loto626ck/app.bsky.feed.post/3lbv5is6h6c2k",
            "cid": "bafyreifgttblhqxmug5te2iji2txrrchna4qw4wfct5kpxxvkt2pu2qtle",
            "author": {
                "did": "did:plc:4hsqiyuogfohtw5loto626ck",
                "handle": "manusandhu.com",
                "displayName": "Manu Sandhu",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:4hsqiyuogfohtw5loto626ck/bafkreif2nfoafynzomrp7jdjrqei36jtcaa54wqlmqnjvl7yaow7cphh5y@jpeg",
                "associated": {
                    "chat": {
                        "allowIncoming": "all"
                    }
                },
                "labels": [],
                "createdAt": "2024-11-12T05:31:25.402Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:04:02.981Z",
                "embed": {
                    "$type": "app.bsky.embed.external",
                    "external": {
                        "description": "From 'Menace II Society' and 'Do The Right Thing' to Ice-T and The Roots, check out every reference from Kendrick Lamar's \"squabble up\" music video.",
                        "thumb": {
                            "$type": "blob",
                            "ref": {
                                "$link": "bafkreidcloza3h425b4rta4sat6ipb343wppzrapsb54j6z7xzhaii3pp4"
                            },
                            "mimeType": "image/jpeg",
                            "size": 452681
                        },
                        "title": "Every Reference In Kendrick Lamar’s “squabble up” Music Video",
                        "uri": "https://www.vibe.com/lists/kendrick-lamar-squabble-up-video-easter-eggs/"
                    }
                },
                "facets": [
                    {
                        "features": [
                            {
                                "$type": "app.bsky.richtext.facet#link",
                                "uri": "https://www.vibe.com/lists/kendrick-lamar-squabble-up-video-easter-eggs/"
                            }
                        ],
                        "index": {
                            "byteEnd": 97,
                            "byteStart": 69
                        }
                    }
                ],
                "langs": [
                    "en"
                ],
                "text": "Every Reference In Kendrick Lamar’s “squabble up” Music Video\n\nwww.vibe.com/lists/kendri..."
            },
            "embed": {
                "$type": "app.bsky.embed.external#view",
                "external": {
                    "uri": "https://www.vibe.com/lists/kendrick-lamar-squabble-up-video-easter-eggs/",
                    "title": "Every Reference In Kendrick Lamar’s “squabble up” Music Video",
                    "description": "From 'Menace II Society' and 'Do The Right Thing' to Ice-T and The Roots, check out every reference from Kendrick Lamar's \"squabble up\" music video.",
                    "thumb": "https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:4hsqiyuogfohtw5loto626ck/bafkreidcloza3h425b4rta4sat6ipb343wppzrapsb54j6z7xzhaii3pp4@jpeg"
                }
            },
            "replyCount": 0,
            "repostCount": 0,
            "likeCount": 0,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:04:04.562Z",
            "labels": []
        }
    },
    {
        "post": {
            "uri": "at://did:plc:rvrtd4tkr5uqt65bswn5dcl7/app.bsky.feed.post/3lbv5ioodbs26",
            "cid": "bafyreicg6hmndw7mgpf2lzwe7ecahlysagnax4jgzygssmvv4zima4xsgu",
            "author": {
                "did": "did:plc:rvrtd4tkr5uqt65bswn5dcl7",
                "handle": "rapalert6.bsky.social",
                "displayName": "Rap Alert",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:rvrtd4tkr5uqt65bswn5dcl7/bafkreigppfidilzpi4ixqiyk3436q3tn7pzgm7kqgowymdjgkqmynbz4cu@jpeg",
                "labels": [],
                "createdAt": "2024-11-14T00:51:10.776Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:03:59.306Z",
                "embed": {
                    "$type": "app.bsky.embed.images",
                    "images": [
                        {
                            "alt": "",
                            "aspectRatio": {
                                "height": 1238,
                                "width": 1290
                            },
                            "image": {
                                "$type": "blob",
                                "ref": {
                                    "$link": "bafkreibyt2z4gfny7zi7t4iia6n7jt5o57zvcunf2tk7y2adlfnxmtlwwy"
                                },
                                "mimeType": "image/jpeg",
                                "size": 461542
                            }
                        },
                        {
                            "alt": "",
                            "aspectRatio": {
                                "height": 1286,
                                "width": 1290
                            },
                            "image": {
                                "$type": "blob",
                                "ref": {
                                    "$link": "bafkreih6qz76c3cy3r4gxvg36zyq75pxfwbbf3rgdwxqppzdvaiecl6ihm"
                                },
                                "mimeType": "image/jpeg",
                                "size": 621121
                            }
                        }
                    ]
                },
                "langs": [
                    "en"
                ],
                "text": "Drake files second piece of legal action against UMG over Kendrick Lamar’s “Not Like Us.”\n\nHe accuses them of defamation and releasing a song falsely accusing him of being a sex offender."
            },
            "embed": {
                "$type": "app.bsky.embed.images#view",
                "images": [
                    {
                        "thumb": "https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:rvrtd4tkr5uqt65bswn5dcl7/bafkreibyt2z4gfny7zi7t4iia6n7jt5o57zvcunf2tk7y2adlfnxmtlwwy@jpeg",
                        "fullsize": "https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:rvrtd4tkr5uqt65bswn5dcl7/bafkreibyt2z4gfny7zi7t4iia6n7jt5o57zvcunf2tk7y2adlfnxmtlwwy@jpeg",
                        "alt": "",
                        "aspectRatio": {
                            "height": 1238,
                            "width": 1290
                        }
                    },
                    {
                        "thumb": "https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:rvrtd4tkr5uqt65bswn5dcl7/bafkreih6qz76c3cy3r4gxvg36zyq75pxfwbbf3rgdwxqppzdvaiecl6ihm@jpeg",
                        "fullsize": "https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:rvrtd4tkr5uqt65bswn5dcl7/bafkreih6qz76c3cy3r4gxvg36zyq75pxfwbbf3rgdwxqppzdvaiecl6ihm@jpeg",
                        "alt": "",
                        "aspectRatio": {
                            "height": 1286,
                            "width": 1290
                        }
                    }
                ]
            },
            "replyCount": 0,
            "repostCount": 0,
            "likeCount": 0,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:04:03.351Z",
            "labels": []
        }
    },
    {
        "post": {
            "uri": "at://did:plc:pq3hkg4fk7kod5i4vty6ecx5/app.bsky.feed.post/3lbv5gkggjc24",
            "cid": "bafyreidpyncjvr6i4laqo6heefxyqp5rq7dwlzdu3sfv6za5bcl667egqu",
            "author": {
                "did": "did:plc:pq3hkg4fk7kod5i4vty6ecx5",
                "handle": "void-poster.bsky.social",
                "displayName": "Voidboy",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:pq3hkg4fk7kod5i4vty6ecx5/bafkreidxilahyxfvmtukudrj7lbioo3hrcijtuokxztduusipokixqelbe@jpeg",
                "labels": [],
                "createdAt": "2024-11-17T09:41:59.226Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:02:47.745Z",
                "embed": {
                    "$type": "app.bsky.embed.record",
                    "record": {
                        "cid": "bafyreib3rr7q3bardigknnqar4zmwx6qhkrw7lyqxuuvclocqncgh5wiuy",
                        "uri": "at://did:plc:jd5ynkua4gin3r2fmb25marj/app.bsky.feed.post/3lbulqmvhdk26"
                    }
                },
                "langs": [
                    "en"
                ],
                "text": "I still can't believe it. Way to prove Kendrick Lamar correct about his assessment of your character. I've never seen an L quite like this."
            },
            "embed": {
                "$type": "app.bsky.embed.record#view",
                "record": {
                    "$type": "app.bsky.embed.record#viewRecord",
                    "uri": "at://did:plc:jd5ynkua4gin3r2fmb25marj/app.bsky.feed.post/3lbulqmvhdk26",
                    "cid": "bafyreib3rr7q3bardigknnqar4zmwx6qhkrw7lyqxuuvclocqncgh5wiuy",
                    "author": {
                        "did": "did:plc:jd5ynkua4gin3r2fmb25marj",
                        "handle": "blackazizanansi.bsky.social",
                        "displayName": "Black Aziz Anansi",
                        "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:jd5ynkua4gin3r2fmb25marj/bafkreifpg3wttragehoglsio4bw4z3aywn6jiikdrlwmc32y63x3rr2mky@jpeg",
                        "labels": [
                            {
                                "src": "did:plc:jd5ynkua4gin3r2fmb25marj",
                                "uri": "at://did:plc:jd5ynkua4gin3r2fmb25marj/app.bsky.actor.profile/self",
                                "cid": "bafyreieicgq77vbkydtzpp42bjriafbibu7fhhjbk2saoqeoyxaa42dvgq",
                                "val": "!no-unauthenticated",
                                "cts": "1970-01-01T00:00:00.000Z"
                            }
                        ],
                        "createdAt": "2023-08-19T14:07:24.775Z"
                    },
                    "value": {
                        "$type": "app.bsky.feed.post",
                        "createdAt": "2024-11-26T17:46:18.526Z",
                        "langs": [
                            "en"
                        ],
                        "text": "All Drake had to do was lay low and go hiking in the mountains for a few months, but no, dude is determined to keep reminding us that he's a loser."
                    },
                    "labels": [],
                    "likeCount": 6908,
                    "replyCount": 116,
                    "repostCount": 535,
                    "quoteCount": 37,
                    "indexedAt": "2024-11-26T17:46:18.848Z",
                    "embeds": []
                }
            },
            "replyCount": 0,
            "repostCount": 0,
            "likeCount": 0,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:02:49.163Z",
            "labels": []
        }
    },
    {
        "post": {
            "uri": "at://did:plc:42w7zjaerk3l2gtyhiw2ekr4/app.bsky.feed.post/3lbv5g7lylc2c",
            "cid": "bafyreibfqbu5rax5wywcrv2u6ic3dhcqixnlhep5tp7anlomo3bjybgwdq",
            "author": {
                "did": "did:plc:42w7zjaerk3l2gtyhiw2ekr4",
                "handle": "blackatit.bsky.social",
                "displayName": "Black in Business",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:42w7zjaerk3l2gtyhiw2ekr4/bafkreihyf6dl3j5eauue7phmapngf7ybgpapuxytugokplgqhw3nizc3oy@jpeg",
                "labels": [],
                "createdAt": "2024-11-04T19:02:43.082Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:02:36.394Z",
                "embed": {
                    "$type": "app.bsky.embed.record",
                    "record": {
                        "cid": "bafyreifsiiggxd2my7vbnvjagiuin72kygf2y4jzoxp72uzbpyjmvk23xa",
                        "uri": "at://did:plc:hx4oby4t6eo3x2txxtxstvv3/app.bsky.feed.post/3lbv5akoc3225"
                    }
                },
                "langs": [
                    "en"
                ],
                "text": "Ay, if you think violence is what it means to be Black because you’re a Drake stan idk what to tel l you. The only person calling for violence was you talking about Kendrick needs to be shot.. and judging by your posts, you have this weird issue with not connecting to Black folk as a community and"
            },
            "embed": {
                "$type": "app.bsky.embed.record#view",
                "record": {
                    "$type": "app.bsky.embed.record#viewRecord",
                    "uri": "at://did:plc:hx4oby4t6eo3x2txxtxstvv3/app.bsky.feed.post/3lbv5akoc3225",
                    "cid": "bafyreifsiiggxd2my7vbnvjagiuin72kygf2y4jzoxp72uzbpyjmvk23xa",
                    "author": {
                        "did": "did:plc:hx4oby4t6eo3x2txxtxstvv3",
                        "handle": "rockyannmarie.bsky.social",
                        "displayName": "DaRocks❤️DRAKE",
                        "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:hx4oby4t6eo3x2txxtxstvv3/bafkreichxtogpu7te5v25lu2khs7imcg5x3lks3ggdmyzn2fxsc4jq3lmu@jpeg",
                        "labels": [],
                        "createdAt": "2024-11-13T12:59:16.095Z"
                    },
                    "value": {
                        "$type": "app.bsky.feed.post",
                        "createdAt": "2024-11-26T22:59:26.677Z",
                        "langs": [
                            "en"
                        ],
                        "reply": {
                            "parent": {
                                "cid": "bafyreib7jqw2bckkvgfkai3izy4lrxh4mbcrkm3rjukmoed5opfu7t4ima",
                                "uri": "at://did:plc:42w7zjaerk3l2gtyhiw2ekr4/app.bsky.feed.post/3lbv52kqrqs2c"
                            },
                            "root": {
                                "cid": "bafyreib7jqw2bckkvgfkai3izy4lrxh4mbcrkm3rjukmoed5opfu7t4ima",
                                "uri": "at://did:plc:42w7zjaerk3l2gtyhiw2ekr4/app.bsky.feed.post/3lbv52kqrqs2c"
                            }
                        },
                        "text": "Where did I lie?"
                    },
                    "labels": [],
                    "likeCount": 0,
                    "replyCount": 0,
                    "repostCount": 0,
                    "quoteCount": 1,
                    "indexedAt": "2024-11-26T22:59:27.152Z",
                    "embeds": []
                }
            },
            "replyCount": 1,
            "repostCount": 0,
            "likeCount": 0,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:02:36.766Z",
            "labels": []
        }
    },
    {
        "post": {
            "uri": "at://did:plc:kgalzsbymqmynnnxutypfbuy/app.bsky.feed.post/3lbv5fraqc22a",
            "cid": "bafyreid4sejyktji6t7q4bihpnoznemkrucavgdj3oyoy4lhkffi6vihki",
            "author": {
                "did": "did:plc:kgalzsbymqmynnnxutypfbuy",
                "handle": "emiblau.bsky.social",
                "displayName": "Stargirl ✨️",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:kgalzsbymqmynnnxutypfbuy/bafkreicjo7smdelmi32zlpbz2ppyxde3jr6qepxvyny4gssxrbpbkao3bq@jpeg",
                "associated": {
                    "chat": {
                        "allowIncoming": "all"
                    }
                },
                "labels": [],
                "createdAt": "2023-11-16T04:46:06.031Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:02:21.344Z",
                "langs": [
                    "es"
                ],
                "text": "When Kendrick Lamar said \"bitch don't kill my vibe\", I really felt that. 🖤"
            },
            "replyCount": 0,
            "repostCount": 0,
            "likeCount": 0,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:02:22.157Z",
            "labels": []
        }
    },
    {
        "post": {
            "uri": "at://did:plc:mm7klipjmjkj6ndlzsb25ys7/app.bsky.feed.post/3lbv5doz36s2d",
            "cid": "bafyreigctyh7wpwhfvee5do3wdo54wjbfyl3z3j6yieclku3vfuaz2hfcq",
            "author": {
                "did": "did:plc:mm7klipjmjkj6ndlzsb25ys7",
                "handle": "brinochz.bsky.social",
                "displayName": "your friendly neighborhood weeb (she/her)",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:mm7klipjmjkj6ndlzsb25ys7/bafkreifttybz5a3jwrajzxtn3h3cbwqz77njvcum4lyzhsibssfjrrd2r4@jpeg",
                "labels": [],
                "createdAt": "2024-11-16T03:08:49.369Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:01:11.888Z",
                "langs": [
                    "en"
                ],
                "text": "Listening to the new Kendrick and so… is he just sick of everybody??? Lmao"
            },
            "replyCount": 0,
            "repostCount": 0,
            "likeCount": 0,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:01:12.247Z",
            "labels": []
        }
    },
    {
        "post": {
            "uri": "at://did:plc:ackrm4jibnlunmzltqso5rl2/app.bsky.feed.post/3lbv5dixrnc2k",
            "cid": "bafyreidl54lu5ywjnytaaxzpnxsnxhk3msblzfsbgfwjdt4gp462sto6mm",
            "author": {
                "did": "did:plc:ackrm4jibnlunmzltqso5rl2",
                "handle": "itspook.com",
                "displayName": "Aaron",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:ackrm4jibnlunmzltqso5rl2/bafkreib5dwhnywa2dcgdfusagtudoiudxl2ybya5dmzi4eejmxbfo2ceyu@jpeg",
                "labels": [],
                "createdAt": "2023-09-01T13:31:48.061Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:01:05.554Z",
                "langs": [
                    "en"
                ],
                "text": "Part of me wants to make a Clark Kent accountant and post real bad journalism takes.\n\n“Drake and Kendrick Lamar in spat over slam poetry.”\n\n“Trump signals new era of economic wonder as he implements poor tax.”"
            },
            "replyCount": 0,
            "repostCount": 0,
            "likeCount": 1,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:01:05.748Z",
            "labels": []
        }
    },
    {
        "post": {
            "uri": "at://did:plc:glfdhxmx6yw7fnygttzyi2bc/app.bsky.feed.post/3lbv5dczsk22k",
            "cid": "bafyreicusp2meollegdesb2mbfbf3skpyssbxwb2ic2bygwmuovuywx7wa",
            "author": {
                "did": "did:plc:glfdhxmx6yw7fnygttzyi2bc",
                "handle": "mofo-fomo.bsky.social",
                "displayName": "",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:glfdhxmx6yw7fnygttzyi2bc/bafkreigb7xwhsiik6mx4zrp2xlojrjawkoo6xiklu6mgwogiinduv7276y@jpeg",
                "labels": [],
                "createdAt": "2024-11-20T17:51:38.553Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:00:59.329Z",
                "langs": [
                    "en"
                ],
                "text": "Just heard Kendrick coming out of a cyber truck. Please be serious."
            },
            "replyCount": 0,
            "repostCount": 0,
            "likeCount": 0,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:00:59.750Z",
            "labels": []
        }
    },
    {
        "post": {
            "uri": "at://did:plc:i7tqfwhesivhmsh2vgculgmg/app.bsky.feed.post/3lbv5d4wrdc25",
            "cid": "bafyreif3kzjhe6fq4i3jaw42w4kkm3q6ggdv2rtcjn3jpbpuxb4lldkjaa",
            "author": {
                "did": "did:plc:i7tqfwhesivhmsh2vgculgmg",
                "handle": "greatdocbrown.xyz",
                "displayName": "Greatdocbrown",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:i7tqfwhesivhmsh2vgculgmg/bafkreifh555d3p646y4umtspxymeljfkgs2l5j5w7ml2b5wnjfx5qmq7zm@jpeg",
                "labels": [],
                "createdAt": "2023-12-26T01:41:32.039Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:00:52.938Z",
                "langs": [
                    "en"
                ],
                "text": "I've never seen a defeat in a rap beef like Drake signing a legal document about damages Kendrick's song did.\n\nHilarious."
            },
            "replyCount": 0,
            "repostCount": 0,
            "likeCount": 1,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:00:53.249Z",
            "labels": []
        }
    },
    {
        "post": {
            "uri": "at://did:plc:e27fnwhogzkbievzmymvef7e/app.bsky.feed.post/3lbv5c5h3ac2t",
            "cid": "bafyreickvnmic6expsdpa7pw763b4sodk626ugt3jc7b5bjn5vj3jwwzj4",
            "author": {
                "did": "did:plc:e27fnwhogzkbievzmymvef7e",
                "handle": "natpalm99.bsky.social",
                "displayName": "nat they/she",
                "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:e27fnwhogzkbievzmymvef7e/bafkreiee3iz77cllr2r7mcnmcecfms6njti5xwf4bzvt6hznhy22egycca@jpeg",
                "labels": [
                    {
                        "src": "did:plc:e27fnwhogzkbievzmymvef7e",
                        "uri": "at://did:plc:e27fnwhogzkbievzmymvef7e/app.bsky.actor.profile/self",
                        "cid": "bafyreieh7gq6bvnvjejf24cngauq7z66qtvhak53bnbvlofs3xwpiek56e",
                        "val": "!no-unauthenticated",
                        "cts": "2024-11-14T13:44:12.827Z"
                    }
                ],
                "createdAt": "2024-11-14T13:44:18.125Z"
            },
            "record": {
                "$type": "app.bsky.feed.post",
                "createdAt": "2024-11-26T23:00:19.917Z",
                "langs": [
                    "en"
                ],
                "text": "it’s still funny kendrick called drake white and his son a Black man"
            },
            "replyCount": 1,
            "repostCount": 0,
            "likeCount": 2,
            "quoteCount": 0,
            "indexedAt": "2024-11-26T23:00:20.455Z",
            "labels": []
        }
    }
]
}
```
