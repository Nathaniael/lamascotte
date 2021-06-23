const { CAT_API_KEY, CAT_API_URL } = require('../../config.js');
const querystring = require('querystring');
const r2          = require('r2');

module.exports.run = async (client,message,args, serverQueue) => {
      var headers = {
        'X-API-KEY': CAT_API_KEY,
    }
    var query_params = {
      'has_breeds':true,
      'mime_types':'jpg,png',
      'size':'small',
      'sub_id': message.author.username,
      'limit' : 1
    }
    let queryString = querystring.stringify(query_params);

    try {
      let _url = CAT_API_URL + `v1/images/search?${queryString}`;
      let response = await r2.get(_url , {headers} ).json
        var images = response;
        var image = images[0];
        var breed = image.breeds[0];
        console.log('message processed','showing',breed)
        message.channel.send( "***"+breed.name + "*** \r *"+breed.temperament+"*", { files: [ image.url ] } );
    } catch(error) {
        console.log(error)
    }
  }

  module.exports.help = {
    name: "cat",
    description: "Envoie une photo de chat aléatoire",
    args: false
  };