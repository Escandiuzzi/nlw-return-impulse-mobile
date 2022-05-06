import { ArrowLeft } from "phosphor-react-native";
import React, { useState } from "react";
import { View, Image, Text } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { theme } from "../../theme";
import { feedbackTypes } from "../../utils/feedbackTypes";
import { Button } from "../Button";
import { ScreenshotButton } from "../ScreenshotButton";
import { FeedbackType } from "../Widget";
import { styles } from "./styles";
import {captureScreen} from "react-native-view-shot";
import { api } from "../../libs/api";
import * as FileSystem from "expo-file-system";

interface Props {
    feedbackType : FeedbackType,
    onFeedbackCanceled: () => void;
    onFeedbackSent: () => void;
}

export function Form({ feedbackType, onFeedbackCanceled, onFeedbackSent }: Props) {
    const [isSendingFeedback, setIsSendingFeedback] = useState(false);
    const [screenshot, setScreenshot] = useState<string|null>(null);
    const [comment, setComment] = useState<string>('');

    const feedbackTypeInfo = feedbackTypes[feedbackType];

    function handleScreenshot() {
        captureScreen({
            format: 'jpg',
            quality: 0.8
        }).then(uri => setScreenshot(uri))
          .catch(error => console.log(error));
    }

    function handleScreenshotRemove() {
        setScreenshot(null);
    }

    async function handleSendFeedback() {
        if(isSendingFeedback)
            return;
        
        setIsSendingFeedback(true);

        const screenshotBase64 = screenshot && await FileSystem.readAsStringAsync(screenshot, {encoding: 'base64'});

        try {
            await api.post('/feedbacks', {
                type: feedbackType,
                comment: comment,
                screenshot: `data:image/png;base64, ${screenshotBase64}`,
            })

            onFeedbackSent();
        } catch (error) {
            console.log(error);
            setIsSendingFeedback(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onFeedbackCanceled}>
                    <ArrowLeft
                        size={24}
                        weight="bold"
                        color={theme.colors.text_secondary}
                    />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Image source={feedbackTypeInfo.image} style={styles.image}/>
                    <Text style={styles.titleText}>
                        { feedbackTypeInfo.title }
                    </Text>
                </View>
            </View>

            <TextInput 
                multiline 
                style={styles.input}
                placeholder="Algo não está funcionando bem? Queremos corrigir. Conte com detalhes o que está acontecendo."
                placeholderTextColor={theme.colors.text_secondary} 
                autoCorrect={false}
                onChangeText={setComment}/>
        
            <View style={styles.footer}>
                <ScreenshotButton screenshot={screenshot} onTakeShot={handleScreenshot} onRemoveShot={handleScreenshotRemove}/>
                <Button isLoading={false} />
            </View>
        
        </View>
    );
}