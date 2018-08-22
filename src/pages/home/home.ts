import { Component, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TextToSpeech } from '@ionic-native/text-to-speech';

declare var ApiAIPromises: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [SpeechRecognition, TextToSpeech]
})
export class HomePage {

  question: string = '';
  answers = [];
  listening = false;

  constructor(
    public navCtrl: NavController,
    public ngZone: NgZone,
    public platform: Platform,
    private speechRecognition: SpeechRecognition,
    private tts: TextToSpeech) {
    platform.ready().then(() => {
      ApiAIPromises.init({
        clientAccessToken: "769af9a04dac4a8495ef3802c14ccd30"
      }).then(res => {
        console.log("res:", res);
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
    })
  }

  ask() {
    if (!this.listening) {
      this.listening = true;
      this.speechRecognition.startListening({ language: 'pt-BR' })
        .subscribe(
          (matches: Array<string>) => {
            console.log(matches);
            this.question = matches[0];
            ApiAIPromises.requestText({
              query: matches[0]
            })
              .then(({ result: { fulfillment: { speech } } }) => {
                this.ngZone.run(() => {
                  this.tts.speak({text:speech, locale: 'pt-BR', rate: 1.5})
                    .then(() => console.log('Success'))
                    .catch((reason: any) => console.log(reason));
                  this.answers.push(speech);
                });
              })
          },
          (onerror) => console.log('error:', onerror)
        )
    } else {
      this.listening = false;
      this.speechRecognition.stopListening();
    }
  }

}
