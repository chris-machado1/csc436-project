import * as tmImage from '@teachablemachine/image';

class PlantModel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.render();
        await this.initModel();
    }

    async initModel() {
        const modelURL = './assets/model/model.json';
        const metadataURL = './assets/model/metadata.json';
        
        this.model = await tmImage.load(modelURL, metadataURL);
        this.maxPredictions = this.model.getTotalClasses();

        const flip = true; 
        this.webcam = new tmImage.Webcam(200, 200, flip); 
        await this.webcam.setup();
        await this.webcam.play();

        const webcamContainer = this.shadowRoot.querySelector('#webcam-container');
        webcamContainer.appendChild(this.webcam.canvas);

        const labelContainer = this.shadowRoot.querySelector('#label-container');
        for (let i = 0; i < this.maxPredictions; i++) {
            labelContainer.appendChild(document.createElement('div'));
        }

        this.loop();
    }

    async loop() {
        this.webcam.update(); 
        await this.predict();
        window.requestAnimationFrame(() => this.loop());
    }

    async predict() {
        const predictions = await this.model.predict(this.webcam.canvas);
        const labelContainer = this.shadowRoot.querySelector('#label-container');
        predictions.forEach((prediction, i) => {
            const classPrediction = `${prediction.className}: ${prediction.probability.toFixed(2)}`;
            labelContainer.childNodes[i].innerHTML = classPrediction;
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    text-align: center;
                }
                #webcam-container {
                    margin: 10px auto;
                }
                #label-container {
                    margin-top: 10px;
                    color: #31d53d;
                    font-size: 1.2em;
                }
            </style>
            <div>Plant Health Checker</div>
            <div id="webcam-container"></div>
            <div id="label-container"></div>
        `;
    }
}

customElements.define('plant-model', PlantModel);
