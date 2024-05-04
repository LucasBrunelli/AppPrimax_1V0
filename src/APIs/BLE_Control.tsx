import React, { useState, useEffect ,useMemo } from 'react';
import { BleManager, Device, Characteristic, Subscription } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import { PermissionsAndroid, Platform } from 'react-native';
const managerBLE = new BleManager();



// Utilizar biblitoeca BLE (Bluetooth Low Energy) cmd = npm install --save react-native-ble-plx   
// Utilizar biblitoeca de tratamento de dados 64b cmd = npm install react-native-base64
// Documentação para biblioteca Bluetooth Low Energy  = https://www.npmjs.com/package/react-native-ble-plx

const useBLEManager = () => {

    
    const [DevIdConnected, set_DevIdConnected] = useState('');      // ID do dispositivo conectado ex: 5C:46:B0:72:2B:6F (string)
    const [DevNameConect, set_DevNameConect] = useState('');        // Nome do dispositivo conectado ex: Primax Bike (string)
    const [ListDevsON, set_ListDevsON] = useState<Device[]>([]);    // Lista de dispositivos disponiveis (Device)
    const [SpeedNotify, set_SpeedNotify] = useState('');            // Velocidade recebida de forma assincrona 
    const [PowerNotify, set_PowerNotify] = useState('');            // Potencia recebida de forma assincrona 
    const [BatteryNotify, set_BatteryNotify] = useState('');        // Nivel da bateria recebida de forma assincrona 
    const [CellsVoltsNotify, set_CellsVoltsNotify] = useState('');  // Tensão por celula recebida de forma assincrona    
    const [BtnScanning, setBtnScanning] = useState(false);          // Flag para sinalizar poresso de escaneamento    

  

    // Função para pedir permissoes para o aplicativo utilizar a localização e bluetooth
    // Logica para IOS ainda deve ser definida, dentro dessa função
    async function requestBluetoothAndLocationPermission() {
        if (Platform.OS === 'android') {
            const bluetoothPermissions = [
                // PermissionsAndroid.PERMISSIONS.BLUETOOTH,
                // PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
            ];
            const locationPermission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

            const bluetoothStatus = await PermissionsAndroid.requestMultiple(bluetoothPermissions);
            const locationStatus = await PermissionsAndroid.request(locationPermission);
    
            if (locationStatus === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Location permission granted');
            } else {
                console.log('Location permission denied');
            }
    
            if (Object.values(bluetoothStatus).every(status => status === PermissionsAndroid.RESULTS.GRANTED)) {
                console.log('Bluetooth permissions granted');
            } else {
                console.log('Bluetooth permissions denied');
                return;
            }
        }
    }



    // Função que escanea todos dispositivos bluetooth disponiveis e coloca em uma lista do tipo Device
    const BleScan = () => {
    
        setBtnScanning(true);
        managerBLE.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                console.error('Scan error:', error);
                setBtnScanning(false);
                return;
            }
    
            if (scannedDevice) {
                set_ListDevsON(prevDevices => {
                const deviceIndex = prevDevices.findIndex(device => device.id === scannedDevice.id);
                if (deviceIndex === -1) {
                    return [...prevDevices, scannedDevice];
                }
                return prevDevices;
                });
            }
        });
    
        // Tempo maximo de 30 segundo para escanemento
        setTimeout(() => {
            managerBLE.stopDeviceScan();
            setBtnScanning(false);
        }, 30000);
    };


    
    // Função que estabelece a conexão com um dispostivio escolhido
    async function BleConnect(dev: Device) {
        console.log("Tentando conectar com id = " + dev.id);
        if (DevIdConnected == '') {
            try {
                const device = await managerBLE.connectToDevice(dev.id);  // Conetcta com o dispositivo            
                await device.discoverAllServicesAndCharacteristics();     // Descobre todos serviços e caracteristicas
                await device.requestMTU(128);                             // Define MTU = 128 bytes (Maximum Transmission Unit)
                set_DevIdConnected(dev.id);
                set_DevNameConect(dev.name || '');            

                // Monitoramento de Notificação Nivel da bateria recebia pela Bike
                device.monitorCharacteristicForService(      
                    "0000180f-0000-1000-8000-00805f9b34fb",  // UUID do serviço
                    "00002a19-0000-1000-8000-00805f9b34fb",  // UUID da característica para notificações de Nivel da bateria
                    (error, characteristic) => {
                        if (error) {
                            console.error('Erro ao monitorar característica:', error);
                            return;
                        }
                        if (characteristic?.value) {
                            const text = base64.decode(characteristic.value);
                            set_BatteryNotify(text);
                        }
                    }
                );

                // Monitoramento de Notificação Potencia recebia pela Bike
                device.monitorCharacteristicForService(      
                    "0000180f-0000-1000-8000-00805f9b34fb",  // UUID do serviço
                    "00002A37-0000-1000-8000-00805f9b34fb",  // UUID da característica para notificações de Potencia
                    (error, characteristic) => {
                        if (error) {
                            console.error('Erro ao monitorar característica:', error);
                            return;
                        }
                        if (characteristic?.value) {
                            const text = base64.decode(characteristic.value);
                            set_PowerNotify(text);
                        }
                    }
                );

                // Monitoramento de Notificação Velocidade recebia pela Bike
                device.monitorCharacteristicForService(      
                    "0000180f-0000-1000-8000-00805f9b34fb",  // UUID do serviço
                    "00002A67-0000-1000-8000-00805f9b34fb",  // UUID da característica para notificações de Velocidade
                    (error, characteristic) => {
                        if (error) {
                            console.error('Erro ao monitorar característica:', error);
                            return;
                        }
                        if (characteristic?.value) {
                            const text = base64.decode(characteristic.value);
                            set_SpeedNotify(text);
                        }
                    }
                );
                
                console.log("Dispositivo " + DevNameConect + " id: " + DevIdConnected + " Conectado!");

            } catch (error) {
                console.error('Erro ao conectar ao dispositivo:', error);
                throw error;
            }
    
        } else {
            console.log("Dispositivo" + DevNameConect + " já esta conectado");
        }
    }
    


    // Função para enviar uma string de no maixmo 128 caracteres para bicicleta.
    async function BleSend(dataSend: string) {
        try {
            const characteristic = await managerBLE.writeCharacteristicWithoutResponseForDevice(
                DevIdConnected,
                "0000180f-0000-1000-8000-00805f9b34fb",
                "00002a19-0000-1000-8000-00805f9b34fb",
                base64.encode(dataSend),
            );
            console.log('Data sent and characteristic value:', base64.decode(characteristic.value ?? ''));
        } catch (error) {
            console.error('Failed to send data:', error);
        }
    }



    // Exporta Dados e Funçoes para o componente principal
    return {
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
    };
};

// Exporta o componente useBLEManager
export default useBLEManager;




