class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistService = playlistsService;
    this._validator = validator;

    this.postPlaylistSongsHandler = this.postPlaylistSongsHandler.bind(this);
    this.getPlaylistSongsByIdHandler = this.getPlaylistSongsByIdHandler.bind(this);
    this.deletePlaylistSongsByIdHandler = this.deletePlaylistSongsByIdHandler.bind(this);
  }

  // playlist_songs
  async postPlaylistSongsHandler(request, h) {
    // console.log('DEBUG VALIDATOR', this._validator);
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongsService.addPlaylistSongs({
      playlist_id: id, song_id: songId, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist lagu berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistSongsService.getPlaylistSongsById(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongsByIdHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongsService.deletePlaylistSongsById({ playlist_id: id, song_id: songId });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = PlaylistSongsHandler;
