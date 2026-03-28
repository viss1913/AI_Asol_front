import React from 'react';
import { Helmet } from 'react-helmet-async';
import Editor from './Editor';

const ImageGeneration = () => {
    return (
        <>
            <Helmet>
                <title>Генерация картинок нейросетью Flux онлайн | AI Asol</title>
                <meta name="description" content="Создавайте фотореалистичные изображения и ИИ-арты с помощью передовых моделей Flux и Nano Banana. Быстрая генерация и безупречное качество." />
            </Helmet>
            <Editor defaultTab="image" />
        </>
    );
};

export default ImageGeneration;
