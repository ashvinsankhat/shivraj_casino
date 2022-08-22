==========================================================================

choose_server_url : http://3.108.54.21:3000/chooseServer?det=android

Server Ip : 3.108.54.21

Server Start :

    forever start game_http_server.js 3000 3.108.54.21 http
    forever start game_socket_server.js 3001 3.108.54.21 s1_1
    forever start game_servers/game_server.js


     forever start game_socket_server.js 3001 localhost s1_1

==========================================================================
