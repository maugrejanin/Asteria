import { Component, NgZone, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Navbar } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';
declare var ApiAIPromises: any;


class Chat {
  type: string;
  message: string;
  createdAt: Date;
}

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  providers: [SpeechRecognition, TextToSpeech]

})
export class ChatPage {
  @ViewChild(Navbar) navBar: Navbar;
  chats: Array<Chat> = [];
  listening = false;
  message: string;
  btn_listen;
  constructor(public navCtrl: NavController, public navParams: NavParams, public ngZone: NgZone,
    public platform: Platform,
    private speechRecognition: SpeechRecognition,
    private tts: TextToSpeech) {
    platform.ready().then(() => {
      let startPhrase = "Olá Letícia, como posso te ajudar?";
      this.addChat(startPhrase, "bot");
      ApiAIPromises.init({
        clientAccessToken: "076f9817cd1b404db747d4ba1bc4871c",
        lang: 'pt-BR'
      })

      this.speechRecognition.hasPermission()
        .then((hasPermission: boolean) => {
          if (!hasPermission) {
            // Request permissions
            this.speechRecognition.requestPermission()
              .then(
                () => console.log('Granted'),
                () => console.log('Denied')
              )
          }
        })

      ApiAIPromises.setListeningStartCallback(function () {
        console.log("listening started");
      });

      ApiAIPromises.setListeningFinishCallback(function () {
        console.log("listening stopped");
      });
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    this.navBar.backButtonClick = () => {
      this.cancelar();
      this.navCtrl.pop();
    }

  }

  speechText(text) {
    try {
      this.ngZone.run(async () => {
        await this.tts.speak({ text: text, locale: 'pt-BR', rate: 1.6 });
      });
    } catch (error) {

    }

  }

  async sendMessage() {
    try {
      this.addChat(this.message, 'user');
      let responseMessage = (await ApiAIPromises.requestText({ query: this.message })).result.fulfillment.speech;
      this.addChat(responseMessage, 'bot');
      this.message = '';
      this.ngZone.run(async () => {
        await this.tts.speak({ text: responseMessage, locale: 'pt-BR', rate: 1.6 });
      });
    } catch (e) {
      console.log('errorere:', e);
    }
  }

  // async sendVoice() {
  //   try {
  //     ApiAIPromises.requestVoice()
  // 		.then( (response) => {
  // 			console.log("res:", response);
  // 		})
  // 		.fail(function (error) {
  // 			// after stop listening will be thrown "no speech input"
  // 			console.log("err:", error);

  // 		})
  //   } catch (e) {
  //     alert(e);
  //   }
  // }

  addChat(message: string, type: string) {
    if (type == 'bot') {
      this.speechText(message);
    }

    this.chats.push({ message: message, type: type, createdAt: new Date() });
  }

  startListen() {
    console.log('listen');
    this.listening = true;
    this.speechRecognition.startListening({ language: 'pt-BR', showPartial: true })
      .subscribe(
        (matches: Array<string>) => {
          console.log(matches);
          this.message = matches[0];
          // this.sendMessage();
        },
        (onerror) => console.log('error:', onerror)
      )
  }

  stopListen() {
    this.speechRecognition.stopListening();
    if(this.message.length > 0){
      this.sendMessage();
    } 
  }

  cancelar() {
    ApiAIPromises.cancelAllRequests();
  }

}
