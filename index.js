
const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');
const { MessageMedia } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth(),
});
    

client.initialize();

client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

client.on('authenticated', () => {
  console.log('AUTENTICADO!');
  });

client.on('ready', () => {
  console.log('Conexão estabelecida com sucesso!');
  
});

client.on('group_join', (notification) => {
  // User has joined or been added to the group.
  console.log('novo membro: ', notification);
  notification.reply('_novo membro entrou no grupo!_');
});

client.on('group_update', (notification) => {
  // Group picture, subject or description has been updated.
  console.log('update', notification);
  var id = notification.chatId;
  client.sendMessage(id, '_dados do grupo foram alterados!_');
  
});

// escutando menssagens recebidas
client.on('message', async (message)  => {
   
	/*if(message.body === '#start'){
      const media = MessageMedia.fromFilePath('bot.jpg');

      client.sendMessage(message.from, media,{caption: 'Olá bem vindo\n*O Bot foi iniciado com sucesso no grupo!*'});

  }*/

  if(message.body === '#menu'){
    client.sendMessage(message.from, '*Funções do bot:*\n\n#bot - informações sobre o bot\n#adm - promover membro a adm'+
    '\n#marcar-todos - marca todos os membros\n#simule-digitar - simula bot digitando\n#simule-gravar - simula bot gravando áudio')


  }

  if (message.body === '#bot') {
    const chats = await client.getChats();
    let info = client.info;
    const chat = await message.getChat();
    
    client.sendMessage(message.from, `*Informações do bot:*\n\nNome: *${info.pushname}*\nNúmero: *${info.wid.user}*\nPlataforma: *${info.platform}*\nGrupo: *${chat.name}*\nChats no Pv: *${chats.length}*`);
  }


  if (message.body === '#simule-digitar') {
    const chat = await message.getChat();
    // simulates typing in the chat
    chat.sendStateTyping();
    chat.sendMessage()

  }

  if (message.body === '#simule-gravar') {
    const chat = await message.getChat();
    // simulates typing in the chat
    chat.sendStateRecording(); 

  }
  
  // promover membro a administrador
  if(message.body === '#adm'){ 
    client.sendMessage(message.from, '_envia o comando junto com o *@* do membro. exemplo: *#adm @example*_');
  }

  if (message.body.includes('#adm @')){

      let chat = await message.getChat();
      var chat_id = chat.id._serialized;
      var chat_name = chat.name

      const mentions = await message.getMentions();
      var user = '';
      var user_name ='';
  
      for(let contact of mentions) {
          user = contact.id._serialized;
          user_name = contact.pushname;
      }
    
      chat = await client.getChatById(chat_id); // Group Id
      await chat.promoteParticipants([user]); // User Id
      console.log(user+' foi promovido a adm no grupo: '+chat_id);
      chat.sendMessage(`_*${user_name}* foi promovido a adm no grupo: *${chat_name}*_`);
      

  }

  // excluir menssagens de membros que mandam links de outros canais
  if (message.body.includes('https://wa.me/') || message.body.includes('https://chat.whatsapp.com/')) {
    
     var x = client.getChatById(message.from);    
     client.sendMessage(message.from, '_proibido enviar links de grupos!_');
     message.delete(true);
     
  }

    // excluir menssagens de membros que mandam links pornográficos
    if (message.body.includes('pornhub.com') || message.body.includes('xvideos.com')) {
    
    var x = client.getChatById(message.from);    
    client.sendMessage(message.from, '_proibido enviar links pornográficos no grupos!_');
    message.delete(true);
    
 }

  // marcar todos os membros
  if(message.body === '#marcar-todos') {
    const chat = await message.getChat();
    
    let text = "_Marcando todos os membros:_ ";
    let mentions = [];

    for(let participant of chat.participants) {
        const contact = await client.getContactById(participant.id._serialized);
        
        mentions.push(contact);
        text += `@${participant.id.user} `;
    }

    await chat.sendMessage(text, { mentions });
}

if(message.body == ''){
   
   


}

    
});
 
 