export interface ObjectInfo {
  h1: string;
  paragraph: string;
  image?: string; // Optional image for extra flair
}

export const objectInfoMap: { [key: string]: ObjectInfo } = {
  "Prop": {
    h1: "Propeller",
    paragraph: "The Propeller is the airplane's powerhouse, converting engine energy into forward thrust. It's the key player in getting you off the ground and keeping you moving.",
  },
  "Flaps": {
    h1: "Flaps",
    paragraph: "Flaps serve a crucial role during takeoff and landing, increasing the wing's lift. They're the unsung heroes that make your ascent and descent smoother.",
  },
  "Elevator": {
    h1: "Elevator",
    paragraph: "The Elevator controls the airplane's pitch, enabling it to climb or descend. It's the tool that helps you reach new heights or come back down to Earth.",
  },
  "Aileron": {
    h1: "Ailerons",
    paragraph: "Ailerons manage the roll of the airplane, facilitating turns. They're the subtle artists that help you navigate the skies with precision.",
  },
  "Rudder": {
    h1: "Rudder",
    paragraph: "The Rudder takes charge of the airplane's yaw, aiding in left or right turns. It's your go-to for directional control on the vertical axis. You might notice the front wheel turns in coordination with the rudder to allow turning on the ground.",
    // image: "rudder-image-url"
  },
};
