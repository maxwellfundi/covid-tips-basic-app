import { Injectable } from "@angular/core";
import { FCM } from "@ionic-native/fcm/ngx";
import { Device } from "@ionic-native/device/ngx";
import { HTTP } from "@ionic-native/http/ngx";
import { environment } from "src/environments/environment";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class NotificationService {
  public messageSubject: Subject<IRapidProMessage> = new Subject();

  fcm_token: string;
  // NOTE - use ionic native http instead of angular/browser to avoid cors issues
  constructor(private fcm: FCM, private device: Device, private http: HTTP) {}
  /**
   * Initialisation is called from app.component.ts after platform ready
   * (currently only when running on device/cordova)
   * Obtain push notification token and provide to RapidPro for messaging.
   * Subscribe to messages.
   */
  init() {
    this.fcm.getToken().then((token) => {
      console.log(token);
      this.registerRapidproToken(token);
    });
    // Example code to subscribe to a specific topic.
    // Not required for general notifications
    this.fcm.subscribeToTopic("test").then(
      (v) => console.log("subscription", v),
      (err) => console.log("err", err)
    );
    this.fcm
      .onNotification()
      .subscribe((data) => this.handleNotification(data as IRapidProMessage));
    this.fcm.onTokenRefresh().subscribe((token) => {
      this.registerRapidproToken(token);
    });
    this.fcm.hasPermission().then((hasPermission) => {
      if (hasPermission) {
        console.log("Has permission!");
      }
    });
  }

  handleNotification(message: IRapidProMessage) {
    console.log("message received", message);
    // alert(`Message Received: ${message.message}`);
    setTimeout(() => {
      if (message) {
        this.messageSubject.next(message);
      }
    });
  }
  /**
   * Send a message to rapidpro servers
   */
  async sendRapidproMessage(msg: string) {
    const { receiveUrl } = environment.rapidPro;
    const from = this.device.uuid;
    const fcm_token = this.fcm_token;
    const data: IRapidProMessageData = { msg, fcm_token, from };
    try {
      const res = await this.http.post(receiveUrl, data, {});
      console.log("message sent", res);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * When device starts inform rapidpro of device id token for
   * receiving push notifications. Link to an ID unique to the device
   * so that token updates do not create new rapidpro contacts
   */
  async registerRapidproToken(fcm_token: string) {
    this.fcm_token = fcm_token;
    const { contactRegisterUrl } = environment.rapidPro;
    const urn = this.device.uuid;
    const name = `app-${urn}`;
    const data: IRapidProRegistrationData = { urn, fcm_token, name };
    try {
      const res = await this.http.post(contactRegisterUrl, data, {});
      console.log("token registered", res);
    } catch (error) {
      console.error(error);
    }
  }
}

interface IRapidProMessageData {
  msg: string;
  fcm_token: string;
  from: string;
}

interface IRapidProRegistrationData {
  urn: string; // rapidpro contact identifier
  fcm_token: string;
  name?: string;
}

export interface IRapidProMessage {
  body: string;
  message: string;
  message_id: string;
  title: string;
  type: string;
  wasTapped: boolean; // informs whether message received in app foreground or background
  quick_replies?: string; // string with JSON array. e.g "["English","Malay"]"
}

export const MOCK_RAPIDPRO_MESSAGE: IRapidProMessage = {
  body: "Hello from Rapidpro",
  message: "Hello from Rapidpro",
  message_id: "5",
  title: "Firebase Cloud Messaging - Tips Demo App",
  type: "rapidpro",
  wasTapped: false,
};
