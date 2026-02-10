import ytSearch from "yt-search";

export default async function handler(req, res) {
  try {
    const { song } = req.query;

    if (!song) {
      return res.status(400).json({
        success: false,
        message: "Song name is required"
      });
    }

    // 🔍 1. YouTube public search (NO cookies)
    const searchResult = await ytSearch(song);

    if (!searchResult.videos || searchResult.videos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No results found"
      });
    }

    // 🎯 2. Pick top result
    const top = searchResult.videos[0];
    const youtubeUrl = top.url;

    // 🌐 3. Call downloader API
    const downloaderApi =
      "https://social-downloader.kumaripinki845459.workers.dev/?url=" +
      encodeURIComponent(youtubeUrl);

    const response = await fetch(downloaderApi);
    const data = await response.json();

    if (!data.formats || data.formats.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No downloadable formats found"
      });
    }

    // 🎧 4. Pick best audio
    const audio = data.formats.find(
      f => f.type === "audio"
    );

    if (!audio) {
      return res.status(500).json({
        success: false,
        message: "Audio not available"
      });
    }

    // ✅ 5. Final JSON output
    return res.json({
      success: true,
      query: song,
      title: data.title || top.title,
      artist: top.author?.name || top.author || "Unknown",
      duration: top.timestamp,
      thumbnail: top.thumbnail,
      youtube_url: youtubeUrl,
      audio: {
        quality: audio.quality || "unknown",
        format: audio.ext || "mp3",
        download_url: audio.url
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
