import * as THREE from 'three';
import Application from '../Application';
import BakedModel from '../Utils/BakedModel';
import Resources from '../Utils/Resources';

export default class Environment {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;
    bakedModels: BakedModel[];

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.bakeModel();
        this.setModel();
    }

    bakeModel() {
        const { gltfModel, texture } = this.resources.items;

        // Room, rock face and the sea/sky backdrop each carry their own baked texture
        this.bakedModels = [
            new BakedModel(
                gltfModel.environmentModel,
                texture.environmentTexture,
                900
            ),
            new BakedModel(gltfModel.rockModel, texture.rockTexture, 900),
            new BakedModel(
                gltfModel.exteriorModel,
                texture.exteriorTexture,
                900
            ),
        ];
    }

    setModel() {
        for (const bakedModel of this.bakedModels) {
            this.scene.add(bakedModel.getModel());
        }
    }

    update() {}
}
