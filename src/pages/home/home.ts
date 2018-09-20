import { Component, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';

declare var ApiAIPromises: any;

class Chat {
  type: string;
  message: string;
  createdAt: Date;
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [SpeechRecognition, TextToSpeech]
})
export class HomePage {

  chats: Array<Chat> = [];
  listening = false;
  message: string;

  constructor(
    public navCtrl: NavController,
    public ngZone: NgZone,
    public platform: Platform,
    private speechRecognition: SpeechRecognition,
    private tts: TextToSpeech) {
    platform.ready().then(() => {
      ApiAIPromises.init({
        clientAccessToken: "769af9a04dac4a8495ef3802c14ccd30",
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

  async sendVoice() {
    ApiAIPromises.requestVoice({ query: this.message }
    )
      .then(function (response) {
        console.log('success', response);
      })
      .fail(function (error) {
        console.log(error);
      });
  }

  addChat(message: string, type: string) {
    this.chats.push({ message: message, type: type, createdAt: new Date() });
  }

  startListen() {
    if (!this.listening) {
      this.listening = true;
      this.speechRecognition.startListening({ language: 'pt-BR' })
        .subscribe(
          (matches: Array<string>) => {
            alert(matches);
            this.sendMessage();
          },
          (onerror) => console.log('error:', onerror)
        )
    } else {
      this.listening = false;
      this.speechRecognition.stopListening();
    }
  }

  cancelar() {
    ApiAIPromises.cancelAllRequests();
  }

}
