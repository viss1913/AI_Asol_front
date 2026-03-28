import React from 'react';
import { Helmet } from 'react-helmet-async';
import Editor from './Editor';

const VideoGeneration = () => {
    return (
        <>
            <Helmet>
                <title>Нейросеть для создания видео из текста | AI Asol</title>
                <meta name="description" content="Генерация видео нейросетью онлайн. Доступ к моделям Veo 3.1 и Sora 2. Создавайте потрясающие кинематографичные видеоролики по текстовому описанию." />
            </Helmet>
            <Editor defaultTab="video" />
        </>
    );
};

export default VideoGeneration;
