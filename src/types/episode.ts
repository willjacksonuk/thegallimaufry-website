export interface Episode {
    id: number
    title: string
    audio_url: string
    artwork_url: string
    description: string
    summary: string
    artist: string
    tags: string
    published_at: string
    duration: number
    hq: boolean
    magic_mastering: boolean 
    guid: string
    inactive_at: null 
    custom_url: string
    episode_number: number | null
    season_number: number | null
    episode_type: string
    explicit: boolean
    private: boolean
    total_plays: number
}

/* Here is an example of the data retrieved for a single episode.
{
    "id":16032850,
    "title":"Æthelstan, King of the whole of Britain",
    "audio_url":"https://www.buzzsprout.com/1460611/episodes/16032850-aethelstan-king-of-the-whole-of-britain.mp3",
    "artwork_url":"https://storage.buzzsprout.com/incqla2q8fowfm44tpkak7d16cgg",
    "description":"<p>Think Alfred was great? Check out his grandson. Raised by his badass warrior aunt, Æthelstan was famously pious, a bit of a clever cloggs and a decent fighter. He came to the throne later than most but would have a major impact on the development of England, calling himself the \"king of the whole of Britain.\" Was this really the case? Find out in the pod.</p>",
    "summary":null,
    "artist":"The Gallimaufry",
    "tags":"",
    "published_at":"2024-11-04T06:00:00.000-05:00",
    "duration":3312,
    "hq":false,
    "magic_mastering":true,
    "guid":"Buzzsprout-16032850",
    "inactive_at":null,
    "custom_url":"",
    "episode_number":40,
    "season_number":1,
    "episode_type":"full",
    "explicit":false,
    "private":false,
    "total_plays":106}
*/

