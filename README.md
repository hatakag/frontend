# User interface for demostration and visualization

This is an user interface to demoststrate the results of my [proposed model](https://github.com/hatakag/optimized_model.git).

## Prerequisites

* Nodejs>=v8.11.3 & npm>=6.9.0

## Installation

* Download or clone the project from [here](https://github.com/hatakag/frontend.git)
* Change working directory (cd) to the project folder
* In this folder, open the command line and enter ```npm install```

## Datasets

> Please first download the datasets [here](https://drive.google.com/drive/folders/15idylZGvj0Dxm1Ey4D7K-AT4FzVgMgoK?usp=sharing) and extract them into `src/data/` directory.

Initial datasets are from [HGCN-JE-JR](https://github.com/StephanieWyt/HGCN-JE-JR).

> Run the [proposed model](https://github.com/hatakag/optimized_model.git) to get the final-output-vectors files or download fully from [here](https://drive.google.com/drive/folders/1ur9vG4VnmDaZFvoJCajXB5Zw-IpAr9iK?usp=sharing)

Take the dataset DBP15K (ZH-EN) as an example, the folder "zh_en" contains:
* ent_ids_1: ids for entities in source KG (ZH);
* ent_ids_2: ids for entities in target KG (EN);
* ref_ent_ids: entity links encoded by ids;
* ref_r_ids: relation links encoded by ids;
* rel_ids_1: ids for entities in source KG (ZH);
* rel_ids_2: ids for entities in target KG (EN);
* triples_1: relation triples encoded by ids in source KG (ZH);
* triples_2: relation triples encoded by ids in target KG (EN);
* zh_vectorList.json: the input entity feature matrix initialized by word vectors;
* output_zh_en.npy: the final output entity vectors from the proposed model; 

## Running

* cd to the project folder
* In command line, run ```npm start``` and your browser will open the interface
* In the interface, you can open the datasets we setup before and select the node you want to see its alignments.
