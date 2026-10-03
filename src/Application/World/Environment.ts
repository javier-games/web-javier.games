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
            // Chair, bench and desk props share one baked texture
            new BakedModel(gltfModel.propsModel, texture.propsTexture, 900),
        ];
    }

    /**
     * The tape reel's acrylic case can't be baked (baked textures are opaque),
     * so its walls get a faint transparent material instead.
     */
    setGlass() {
        const material = new THREE.MeshBasicMaterial({
            color: 0xdfe7ee,
            transparent: true,
            opacity: 0.12,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
        const glass = this.resources.items.gltfModel.glassModel.scene;
        glass.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.scale.set(900, 900, 900);
                child.material = material;
            }
        });
        this.scene.add(glass);
    }

    setModel() {
        for (const bakedModel of this.bakedModels) {
            this.scene.add(bakedModel.getModel());
        }
        this.setGlass();
    }

    update() {}
}
