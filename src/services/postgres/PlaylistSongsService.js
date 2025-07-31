const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylistSongs({ playlist_id, song_id }) {
    const id = nanoid(16);

    const querySong = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [song_id],
    };
    const resultSong = await this._pool.query(querySong);

    if (!resultSong.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlist_id, song_id],
    };
    // console.log('==========');
    // console.log(query);
    // console.log('==========');

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongsById(id) {
    const querPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON playlists.owner = users.id
      WHERE playlists.id = $1`,
      values: [id],
    };
    // console.log('====');
    // console.log(querPlaylist);
    // console.log('====');
    const resultPlaylist = await this._pool.query(querPlaylist);

    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = resultPlaylist.rows[0];
    // console.log('=====');
    // console.log(playlist.song_id);
    // console.log('=====');

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlist_songs
      LEFT JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1`,
      values: [id],
    };
    // console.log('---------');
    // console.log(querySongs);
    // console.log('---------');

    const resultSongs = await this._pool.query(querySongs);
    // console.log('=====');
    // console.log(resultSongs);
    // console.log('=====');

    return {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: resultSongs.rows,
    };
  }

  async deletePlaylistSongsById({ playlist_id, song_id }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlist_id, song_id],
    };
    console.log(query);

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;
