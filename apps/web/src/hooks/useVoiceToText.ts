import { ref } from "vue";

export interface Options {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

let instance: SpeechRecognition | null = null;

const getInstance = (options: Options): SpeechRecognition => {
  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!speechRecognition) {
    throw new Error("SpeechRecognition is not supported in this browser.");
  }
  if (!instance) {
    const { lang = "zh-CN", continuous = false, interimResults = false, maxAlternatives = 1 } = options;
    instance = new speechRecognition();
    instance.lang = lang;
    instance.continuous = continuous;
    instance.interimResults = interimResults;
    instance.maxAlternatives = maxAlternatives;
  }
  return instance;
};

export const useVoiceToText = (options: Options = {}) => {
  const recognition = getInstance(options);
  const isRecording = ref(false);
  recognition.onend = () => {
    isRecording.value = false;
  };
  const start = (callback?: (result: string) => void) => {
    isRecording.value = true;
    recognition.start();
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let fullText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const firstAlternative = result?.[0];
        const transcript = firstAlternative?.transcript;
        if (!transcript) continue;
        fullText += transcript;
      }
      if (!fullText) return;
      callback?.(fullText);
    };
  };

  const stop = () => {
    isRecording.value = false;
    recognition.stop();
  };

  return {
    isRecording,
    start,
    stop,
  };
};
