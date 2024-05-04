import React, { useRef, useState, useEffect ,useMemo} from 'react';
import { 
    View, 
    Button,
    Text, 
    StyleSheet, 
    TextInput, 
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import useBLEManager from './src/APIs/BLE_Control';




const App: React.FC = () => {  // Componete Principal


    // Variaveis e funçoes importadas da API Bluetooth src/APIs/BLE_Control.tsx
    const {
        DevIdConnected,
        DevNameConect,
        ListDevsON,
        SpeedNotify,
        PowerNotify,
        BatteryNotify,
        CellsVoltsNotify,
        BtnScanning,
        requestBluetoothAndLocationPermission,
        BleScan,
        BleConnect,
        BleSend,
    } = useBLEManager();
    
    // Variavel para envio de dados
    const [BleMsgToSend, setBleMsgToSend] = useState("");



    // Renderização inicial do componete chamando a função de permissoes
    useEffect(() => {
        requestBluetoothAndLocationPermission();
    }, []);
    


    // Front End Principal, aqui será chamado todas as paginas e componentes graficos
    const scrollViewRef = useRef<ScrollView>(null);
    return (

        <ScrollView ref={scrollViewRef} style={{flex: 1}} scrollEnabled={true} keyboardShouldPersistTaps="always">
        <View style={styles.MainView}>

            {/* Potão para escanear dispostivos diponiveis */}
            <Button title={BtnScanning ? 'Scanning...' : 'Scan Devices'} onPress={BleScan} disabled={BtnScanning} />


            {/* Lista de dispositivos disponiveis */}
            <View 
            style={{height: 120, width: '90%', marginTop: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: 'gray', borderRadius: 20}}>
            <ScrollView style={{flex:1, margin:7}} scrollEnabled={true} nestedScrollEnabled={true}>
                <FlatList
                style={{alignSelf: 'center'}}
                scrollEnabled={false}
                data={ListDevsON}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listItem} onPress={()=> BleConnect(item)}>
                        <Text>{item.name || 'Unnamed Device'}</Text>
                        <Text>{item.id}</Text>
                    </TouchableOpacity>
                )}
                />
            </ScrollView>
            </View>


            {/* Caixas de texto com renderização otimizada */}
            <TextInputOptimized value={SpeedNotify} />
            <TextInputOptimized value={PowerNotify} />
            <TextInputOptimized value={BatteryNotify} />
            <TextInputOptimized value={DevNameConect + "    id: " + DevIdConnected} />   


            {/* Campo para envio de dados */}    
            <View style={{height: 50, width: '90%', marginTop: 20, marginBottom:20, flexDirection: 'row'}}>  

                {/* Caixa de texto com renderização otimizada */}
                <TextBoxOptimized initialValue={BleMsgToSend} setValue={setBleMsgToSend} />
                {/* Botão de envio com renderização otimizada */}     
                <OptimizedButton onPress={() => BleSend(BleMsgToSend)} />

            </View>


        </View>
        </ScrollView>       
    );
};



// Estilização simples, o ideal é que seja feita em outro arquivo
const styles = StyleSheet.create({

    MainView: {
        marginTop:20,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    listItem: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#ddd',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 5
    },
    
});



// Criando um componete de Visualização de texto de forma otimizada usando React.memo
interface TextBoxOptimizedProps {
    initialValue: string;
    setValue: (text: string) => void; // Função para atualizar o texto externamente
}
const TextBoxOptimized: React.FC<TextBoxOptimizedProps> = ({ initialValue, setValue }) => {
    const [text, setText] = useState(initialValue);  // Armazenando o texto atual
    const scrollViewRef = useRef<ScrollView>(null);  // Ref para o ScrollView

    const handleChangeText = (newText: string) => {
        setText(newText);        // Atualiza o estado interno
        setValue(newText); // Atualiza o valor externo
    };

    const memoizedTextInput = useMemo(() => (
        <View style={{height: '100%', width: '80%', backgroundColor: '#FFF', borderWidth: 1, 
            borderColor: 'gray', borderRadius: 20}}>
            <ScrollView ref={scrollViewRef} style={{flex: 1, margin: 7}} scrollEnabled={true} nestedScrollEnabled={true}>
                <TextInput
                    style={{flex: 1, padding: 10, textAlignVertical: 'top', backgroundColor: '#FFF'}}
                    multiline={true}
                    editable={true}
                    scrollEnabled={true}
                    onChangeText={handleChangeText}  // Usa a função para atualizar o texto
                    value={text}  // Exibe o texto
                    onFocus={() => scrollViewRef.current?.scrollToEnd()}  // Rolando para o final ao ganhar foco
                />
            </ScrollView>        
        </View>
    ), [text]); // Recria o componente TextInput somente se 'text' mudar

    return memoizedTextInput;
};



// Criando um componete de Visualização de texto de forma otimizada usando React.memo
interface TextInputOptimizedProps {
    value: string;
}
const TextInputOptimized: React.FC<TextInputOptimizedProps> = ({ value }) => {
    const memoizedTextInput = useMemo(() => (
        <View style={{height: 50, width: '90%', marginTop: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: 'gray', borderRadius: 20}}>
            <ScrollView style={{flex: 1, margin: 7}} scrollEnabled={true} nestedScrollEnabled={true}>
                <TextInput
                    style={{flex: 1, padding: 10, textAlignVertical: 'top', backgroundColor: '#FFF', color: '#000'}}
                    editable={false}
                    multiline={true}
                    value={value}
                    placeholder="Data received"
                />
            </ScrollView>
        </View>
    ), [value]); // Dependendo apenas de 'value', re-renderiza somente se 'value' mudar

    return memoizedTextInput;
};



// Criando um componete de Botão de forma otimizada usando React.memo
interface OptimizedButtonProps {
    onPress: () => void;
}
const OptimizedButton: React.FC<OptimizedButtonProps> = React.memo(({ onPress }) => {
    return (
        <TouchableOpacity 
            style={{flex: 1, marginLeft: 10, borderRadius: 10}} 
            onPress={onPress}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                          backgroundColor: '#24b3e1', borderRadius: 10}}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: '#000'}}>Send</Text>
            </View>
        </TouchableOpacity>
    );
});



export default App;



