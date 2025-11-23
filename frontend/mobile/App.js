import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// --- 1. CONFIGURAÇÃO DA API ---
const API_URL = 'https://ecodenuncia.onrender.com/api'; // URL DE PRODUÇÃO
const api = axios.create({
  baseURL: API_URL
});

// --- PALETA DE CORES ---
const palette = {
  primary: '#005A9C', primaryLight: '#007bff',
  success: '#28a745', danger: '#DC3545', warning: '#FFC107',
  light: '#F4F7F6', white: '#FFFFFF', text: '#333333',
  textSecondary: '#666666', gray: '#ced4da',
  border: '#B0B0B0',
  primaryBackground: '#e6f0f7',
  dangerBackground: '#fbeeee',
};

// --- 2. TELA DE LOGIN ---
const LoginScreen = ({ onLogin, onNavigateCadastro }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) { setError('Email e senha são obrigatórios.'); return; }
    setError(''); setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, senha });
      if (response.data.data.usuario.tipo_usuario === 'cidadao') {
        onLogin(response.data.data.token, response.data.data.usuario);
      } else {
        setError('Acesso negado. Este app é apenas para Cidadãos.');
      }
    } catch (err) {
      if (err.response) { setError(err.response.data.error || 'Credenciais inválidas.'); } 
      else { setError('Erro de rede. Verifique o IP da API e sua conexão.'); }
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.light} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text style={styles.subtitle}>Login do Cidadão</Text>
          
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            value={email} onChangeText={setEmail} 
            keyboardType="email-address" autoCapitalize="none" 
            placeholder="seu@email.com"
            placeholderTextColor={palette.textSecondary} // CORREÇÃO
          />
          
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.inputPassword} 
              value={senha} onChangeText={setSenha} 
              secureTextEntry={!mostrarSenha} 
              autoCapitalize="none" autoCorrect={false}
              placeholder="Sua senha"
              placeholderTextColor={palette.textSecondary} // CORREÇÃO
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeButton}>
              <Text style={styles.eyeButtonText}>{mostrarSenha ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={palette.white} /> : <Text style={styles.buttonPrimaryText}>Entrar</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onNavigateCadastro}>
            <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- 3. TELA: CADASTRO ---
const CadastroScreen = ({ onNavigateLogin, onRegisterSuccess }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => String(email).toLowerCase().match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);

  const handleRegister = async () => {
    setError(''); 
    if (!nome || !email || !senha || !confirmarSenha || !cpf || !telefone || !dataNascimento) { setError('Todos os campos marcados com * são obrigatórios.'); return; }
    if (!validateEmail(email)) { setError('Por favor, insira um e-mail válido.'); return; }
    if (senha !== confirmarSenha) { setError('As senhas não coincidem.'); return; }
    if (senha.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', { 
        nome, email, senha, tipo_usuario: 'cidadao',
        data_nascimento: dataNascimento || null, telefone: telefone || null, cpf: cpf || null
      });
      Alert.alert("Sucesso!", "Conta criada. Por favor, faça login.", [{ text: "OK", onPress: onRegisterSuccess }]);
    } catch (err) {
      if (err.response) { setError(err.response.data.error || 'Erro ao criar conta.'); } 
      else { setError('Erro de rede. Verifique o IP da API e sua conexão.'); }
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.light} />
      <TouchableOpacity style={styles.backButton} onPress={onNavigateLogin}>
          <Text style={styles.backButtonText}>‹ Voltar</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text style={styles.subtitle}>Criar Conta</Text>
          
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput 
            style={styles.input} value={nome} onChangeText={setNome} 
            placeholder="Seu nome" placeholderTextColor={palette.textSecondary} 
          />
          
          <Text style={styles.label}>Email *</Text>
          <TextInput 
            style={styles.input} value={email} onChangeText={setEmail} 
            keyboardType="email-address" autoCapitalize="none" 
            placeholder="seu@email.com" placeholderTextColor={palette.textSecondary}
          />
          
          <Text style={styles.label}>CPF *</Text>
          <TextInput 
            style={styles.input} value={cpf} onChangeText={setCpf} 
            keyboardType="numeric" 
            placeholder="111.222.333-44" placeholderTextColor={palette.textSecondary}
          />
          
          <Text style={styles.label}>Telefone *</Text>
          <TextInput 
            style={styles.input} value={telefone} onChangeText={setTelefone} 
            keyboardType="phone-pad" 
            placeholder="(XX) 9XXXX-XXXX" placeholderTextColor={palette.textSecondary}
          />
          
          <Text style={styles.label}>Data de Nascimento *</Text>
          <TextInput 
            style={styles.input} value={dataNascimento} onChangeText={setDataNascimento} 
            placeholder="DD/MM/AAAA" placeholderTextColor={palette.textSecondary}
          />
          
          <Text style={styles.label}>Senha *</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.inputPassword} 
              value={senha} onChangeText={setSenha} 
              secureTextEntry={!mostrarSenha} 
              autoCapitalize="none" autoCorrect={false}
              placeholder="Mínimo 6 caracteres" placeholderTextColor={palette.textSecondary}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeButton}>
              <Text style={styles.eyeButtonText}>{mostrarSenha ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Confirmar Senha *</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.inputPassword} 
              value={confirmarSenha} onChangeText={setConfirmarSenha} 
              secureTextEntry={!mostrarSenha} 
              autoCapitalize="none" autoCorrect={false}
              placeholder="Repita a senha" placeholderTextColor={palette.textSecondary}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={palette.white} /> : <Text style={styles.buttonPrimaryText}>Criar Conta</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- 4. TELA DE HISTÓRICO (Sem Alterações) ---
const HomeScreen = ({ usuario, onLogout, onNavigateNovaDenuncia, onNavigateEdit, onNavigateEditProfile, denuncias, loadingDenuncias, onExcluirDenuncia, onRefresh }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [motivoExclusao, setMotivoExclusao] = useState('');
  const [denunciaParaExcluir, setDenunciaParaExcluir] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleExcluirPress = (denuncia) => { setDenunciaParaExcluir(denuncia); setModalVisible(true); };
  const handleConfirmarExclusao = () => {
    if (!motivoExclusao) { Alert.alert("Erro", "O motivo da exclusão é obrigatório."); return; }
    onExcluirDenuncia(denunciaParaExcluir.id, motivoExclusao);
    setModalVisible(false); setMotivoExclusao(''); setDenunciaParaExcluir(null);
  };
  const onPullToRefresh = async () => { setRefreshing(true); await onRefresh(); setRefreshing(false); };
  const getStatusStyle = (status) => {
    if (status === 'Resolvida') return { color: palette.success, badge: { backgroundColor: palette.success } };
    if (status === 'Em Análise') return { color: palette.warning, badge: { backgroundColor: palette.warning } };
    if (status === 'Recebida') return { color: palette.danger, badge: { backgroundColor: palette.danger } };
    return { color: palette.textSecondary, badge: { backgroundColor: palette.gray } };
  };
  const primeiroNome = usuario?.nome?.split(' ')[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.light} />
      <Modal transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Denúncia</Text>
            <Text style={styles.modalText}>Por favor, informe o motivo da exclusão:</Text>
            <TextInput 
              style={[styles.input, { marginHorizontal: 0 }]} 
              placeholder="Motivo (ex: duplicada)" placeholderTextColor={palette.textSecondary}
              value={motivoExclusao} onChangeText={setMotivoExclusao} 
            />
            <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: palette.danger, marginHorizontal: 0 }]} onPress={handleConfirmarExclusao}>
              <Text style={styles.buttonPrimaryText}>Confirmar Exclusão</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonSecondary, { marginTop: 10, marginHorizontal: 0 }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.homeHeader}>
        <Text style={styles.headerTitle}>Olá, {primeiroNome}!</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onNavigateEditProfile} style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.homeSubtitle}>Seu histórico de denúncias</Text>
      {loadingDenuncias ? <ActivityIndicator size="large" style={{ marginTop: 20 }} /> : (
        <FlatList
          data={denuncias}
          keyExtractor={(item) => item.id.toString()}
          style={styles.homeList} contentContainerStyle={styles.homeListContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullToRefresh} tintColor={palette.primary} colors={[palette.primary]} />}
          renderItem={({ item }) => {
            const statusStyle = getStatusStyle(item.nome_status);
            return (
              <View style={styles.denunciaCard}>
                <View style={[styles.statusBadge, statusStyle.badge]} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.descricao || "Sem descrição"}</Text>
                  <Text style={styles.cardInfo}>Endereço: {item.endereco_completo || "N/A"}</Text>
                  <Text style={styles.cardInfo}>Ref: {item.ponto_referencia || "N/A"}</Text>
                  <Text style={styles.cardInfo}>Data: {new Date(item.data_criacao).toLocaleDateString('pt-BR')}</Text>
                  <Text style={[styles.cardStatus, { color: statusStyle.color }]}>Status: {item.nome_status}</Text>
                  {item.nome_status !== 'Resolvida' && (
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity onPress={() => onNavigateEdit(item)}><Text style={styles.actionTextEditar}>Editar</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => handleExcluirPress(item)}><Text style={styles.actionTextExcluir}>Excluir</Text></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullToRefresh} tintColor={palette.primary} />}>
              <Text style={styles.emptyText}>Você ainda não fez nenhuma denúncia. Puxe para atualizar.</Text>
            </ScrollView>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={onNavigateNovaDenuncia}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- 5. TELA DE NOVA DENÚNCIA ---
const NovaDenunciaScreen = ({ onBack, onDenunciaCriada }) => {
  const [descricao, setDescricao] = useState('');
  const [endereco, setEndereco] = useState('');
  const [referencia, setReferencia] = useState('');
  const [imagem, setImagem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão negada', 'Precisamos de acesso à câmara.'); return; }
    let result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) { setImagem(result.assets[0]); }
  };
  const handleEscolherFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.'); return; }
    let result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) { setImagem(result.assets[0]); }
  };
  const handleSubmit = async () => {
    if (!imagem || !descricao || !endereco) { Alert.alert("Campos Obrigatórios", "Descrição, Endereço e Foto são obrigatórios."); return; }
    setIsSubmitting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permissão negada', 'Precisamos da sua localização.'); setIsSubmitting(false); return; }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const formData = new FormData();
      formData.append('image', { uri: imagem.uri, name: `denuncia_${Date.now()}.jpg`, type: 'image/jpeg' });
      const uploadResponse = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url_foto = uploadResponse.data.data.url;
      await api.post('/denuncias', { descricao, url_foto, latitude, longitude, endereco_completo: endereco, ponto_referencia: referencia });
      Alert.alert("Sucesso!", "Sua denúncia foi enviada.");
      onDenunciaCriada();
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
      Alert.alert("Erro", "Não foi possível enviar sua denúncia.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.light} />
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>‹ Voltar</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Nova Denúncia</Text>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput 
            style={styles.inputMulti} value={descricao} onChangeText={setDescricao} 
            placeholder="Ex: Sofá abandonado na esquina." placeholderTextColor={palette.textSecondary}
            multiline 
          />
          <Text style={styles.label}>Endereço Completo *</Text>
          <TextInput 
            style={styles.input} value={endereco} onChangeText={setEndereco} 
            placeholder="Ex: Rua das Flores, 123, Bairro Centro" placeholderTextColor={palette.textSecondary}
          />
          <Text style={styles.label}>Ponto de Referência (Opcional)</Text>
          <TextInput 
            style={styles.input} value={referencia} onChangeText={setReferencia} 
            placeholder="Ex: Perto da padaria da esquina" placeholderTextColor={palette.textSecondary}
          />
          <Text style={styles.label}>Foto *</Text>
          <TouchableOpacity style={styles.buttonSecondary} onPress={handleTirarFoto}><Text style={styles.buttonSecondaryText}>Tirar Foto</Text></TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={handleEscolherFoto}><Text style={styles.buttonSecondaryText}>Escolher da Galeria</Text></TouchableOpacity>
          {imagem && ( <Image source={{ uri: imagem.uri }} style={styles.previewImagem} /> )}
          <View style={styles.buttonContainer}>
            {isSubmitting ? <ActivityIndicator size="large" color={palette.primary} /> : (
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
                <Text style={styles.buttonPrimaryText}>Enviar Denúncia</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- 6. TELA: EDITAR DENÚNCIA ---
const EditDenunciaScreen = ({ onBack, onDenunciaEditada, denuncia }) => {
  const [descricao, setDescricao] = useState(denuncia.descricao || '');
  const [endereco, setEndereco] = useState(denuncia.endereco_completo || '');
  const [referencia, setReferencia] = useState(denuncia.ponto_referencia || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!descricao || !endereco) { Alert.alert("Erro", "Descrição e Endereço são obrigatórios."); return; }
    setIsSubmitting(true);
    try {
      await api.put(`/denuncias/${denuncia.id}`, { descricao, endereco_completo: endereco, ponto_referencia: referencia });
      Alert.alert("Sucesso!", "Sua denúncia foi atualizada.");
      onDenunciaEditada();
    } catch (error) {
      console.error("Erro ao editar denúncia:", error);
      Alert.alert("Erro", "Não foi possível atualizar sua denúncia.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.light} />
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>‹ Voltar</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Editar Denúncia</Text>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput 
            style={styles.inputMulti} value={descricao} onChangeText={setDescricao} 
            placeholder="Ex: Sofá abandonado na esquina." placeholderTextColor={palette.textSecondary}
            multiline 
          />
          <Text style={styles.label}>Endereço Completo *</Text>
          <TextInput 
            style={styles.input} value={endereco} onChangeText={setEndereco} 
            placeholder="Ex: Rua das Flores, 123, Bairro Centro" placeholderTextColor={palette.textSecondary}
          />
          <Text style={styles.label}>Ponto de Referência (Opcional)</Text>
          <TextInput 
            style={styles.input} value={referencia} onChangeText={setReferencia} 
            placeholder="Ex: Perto da padaria da esquina" placeholderTextColor={palette.textSecondary}
          />
          <Text style={styles.infoText}>Nota: A foto e a localização não podem ser editadas.</Text>
          <View style={styles.buttonContainer}>
            {isSubmitting ? <ActivityIndicator size="large" color={palette.primary} /> : (
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
                <Text style={styles.buttonPrimaryText}>Salvar Alterações</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- 7. TELA: EDITAR PERFIL ---
const EditProfileScreen = ({ onBack, onProfileUpdated, usuario, onNavigateChangePassword, onLogout }) => {
  const [email, setEmail] = useState(usuario?.email || '');
  const [telefone, setTelefone] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [mostrarSenhaExclusao, setMostrarSenhaExclusao] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email) { setError('O e-mail não pode ficar em branco.'); return; }
    setIsSubmitting(true);
    try {
      const response = await api.put('/users/me', { email, telefone });
      Alert.alert("Sucesso!", "Seu perfil foi atualizado.");
      onProfileUpdated(response.data.data);
    } catch (error) {
      console.error("Erro ao editar perfil:", error);
      setError(error.response?.data?.error || 'Não foi possível atualizar seu perfil.');
    } finally { setIsSubmitting(false); }
  };
  
  const handleDeleteAccount = async () => {
    if (!senhaConfirm) { Alert.alert("Erro", "Por favor, digite sua senha."); return; }
    setLoadingDelete(true);
    try {
      await api.delete('/users/me', { data: { senha: senhaConfirm } });
      Alert.alert("Conta Excluída", "A sua conta foi desativada com sucesso.");
      setLoadingDelete(false);
      setModalVisible(false);
      onLogout();
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      Alert.alert("Erro", error.response?.data?.error || 'Não foi possível excluir sua conta.');
      setLoadingDelete(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.light} />
      <Modal transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir sua Conta?</Text>
            <Text style={styles.modalText}>Esta ação é permanente. Confirme com sua senha:</Text>
            <View style={[styles.passwordContainer, { marginHorizontal: 0 }]}>
              <TextInput 
                style={styles.inputPassword} 
                placeholder="Digite sua senha"
                placeholderTextColor={palette.textSecondary}
                secureTextEntry={!mostrarSenhaExclusao}
                autoCapitalize="none" autoCorrect={false}
                value={senhaConfirm} onChangeText={setSenhaConfirm}
              />
              <TouchableOpacity onPress={() => setMostrarSenhaExclusao(!mostrarSenhaExclusao)} style={styles.eyeButton}>
                <Text style={styles.eyeButtonText}>{mostrarSenhaExclusao ? 'Ocultar' : 'Ver'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: palette.danger, marginHorizontal: 0 }]} onPress={handleDeleteAccount} disabled={loadingDelete}>
              {loadingDelete ? <ActivityIndicator color={palette.white} /> : <Text style={styles.buttonPrimaryText}>Confirmar Exclusão</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonSecondary, { marginTop: 10, marginHorizontal: 0 }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>‹ Voltar</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Editar Perfil</Text>
          <Text style={styles.label}>Email:</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Text style={styles.label}>Telefone:</Text>
          <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="(XX) 9XXXX-XXXX" placeholderTextColor={palette.textSecondary} />
          <View style={styles.buttonContainer}>
            {isSubmitting ? <ActivityIndicator size="large" color={palette.primary} /> : (
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
                <Text style={styles.buttonPrimaryText}>Salvar Perfil</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.infoText}>--- Opções de Segurança ---</Text>
          <TouchableOpacity style={styles.buttonSecondary} onPress={onNavigateChangePassword}>
            <Text style={styles.buttonSecondaryText}>Mudar Senha</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonSecondary, { borderColor: palette.danger, marginTop: 20 }]} onPress={() => setModalVisible(true)}>
            <Text style={[styles.buttonSecondaryText, { color: palette.danger }]}>Excluir Minha Conta</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- 8. NOVA TELA: MUDAR SENHA ---
const ChangePasswordScreen = ({ onBack, onPasswordChanged }) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) { setError('Todos os campos são obrigatórios.'); return; }
    if (novaSenha !== confirmarNovaSenha) { setError('As novas senhas não coincidem.'); return; }
    if (novaSenha.length < 6) { setError('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    setIsSubmitting(true);
    try {
      await api.put('/users/me/password', { senhaAtual, novaSenha });
      Alert.alert("Sucesso!", "Sua senha foi alterada.", [{ text: "OK", onPress: onPasswordChanged }]);
    } catch (error) {
      console.error("Erro ao mudar senha:", error);
      setError(error.response?.data?.error || 'Não foi possível alterar a senha.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.light} />
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>‹ Voltar</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Mudar Senha</Text>
          
          <Text style={styles.label}>Senha Atual *</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.inputPassword} 
              value={senhaAtual} onChangeText={setSenhaAtual} 
              secureTextEntry={!mostrarSenhaAtual} 
              autoCapitalize="none" autoCorrect={false}
              placeholder="Digite sua senha atual" placeholderTextColor={palette.textSecondary}
            />
            <TouchableOpacity onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)} style={styles.eyeButton}>
              <Text style={styles.eyeButtonText}>{mostrarSenhaAtual ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Nova Senha *</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.inputPassword} 
              value={novaSenha} onChangeText={setNovaSenha} 
              secureTextEntry={!mostrarNovaSenha} 
              autoCapitalize="none" autoCorrect={false}
              placeholder="Mínimo 6 caracteres" placeholderTextColor={palette.textSecondary}
            />
            <TouchableOpacity onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)} style={styles.eyeButton}>
              <Text style={styles.eyeButtonText}>{mostrarNovaSenha ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Confirmar Nova Senha *</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.inputPassword} 
              value={confirmarNovaSenha} onChangeText={setConfirmarNovaSenha} 
              secureTextEntry={!mostrarNovaSenha} 
              autoCapitalize="none" autoCorrect={false}
              placeholder="Repita a nova senha" placeholderTextColor={palette.textSecondary}
            />
          </View>
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.buttonContainer}>
            {isSubmitting ? <ActivityIndicator size="large" color={palette.primary} /> : (
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
                <Text style={styles.buttonPrimaryText}>Salvar Nova Senha</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


// --- 9. O APLICATIVO PRINCIPAL (Gestor de Telas) ---
export default function App() {
  const [token, setToken] = useState(null); 
  const [usuario, setUsuario] = useState(null);
  const [telaAtual, setTelaAtual] = useState('Login');
  const [denunciaParaEditar, setDenunciaParaEditar] = useState(null);
  const [denuncias, setDenuncias] = useState([]);
  const [loadingDenuncias, setLoadingDenuncias] = useState(false);

  const handleLogin = (novoToken, novoUsuario) => {
    setToken(novoToken); setUsuario(novoUsuario);
    api.defaults.headers.common['Authorization'] = `Bearer ${novoToken}`;
    setTelaAtual('Home');
  };
  const handleLogout = () => {
    setToken(null); setUsuario(null); setDenuncias([]);
    delete api.defaults.headers.common['Authorization'];
    setTelaAtual('Login');
  };
  const handleProfileUpdated = (novoUsuario) => {
    setUsuario(novoUsuario);
    setTelaAtual('Home');
  };
  const handleNavigateEdit = (denuncia) => {
    setDenunciaParaEditar(denuncia);
    setTelaAtual('EditDenuncia');
  };

  const fetchDenuncias = async () => {
    if (!token) return; 
    setLoadingDenuncias(true);
    try {
      const response = await api.get('/denuncias'); 
      setDenuncias(response.data.data);
    } catch (error) {
      console.error("Erro ao buscar denúncias:", error);
      Alert.alert("Erro", "Não foi possível carregar seu histórico.");
    } finally { setLoadingDenuncias(false); }
  };

  const handleExcluirDenuncia = async (id, motivo) => {
    try {
      await api.put(`/denuncias/${id}/excluir`, { motivo });
      Alert.alert("Sucesso", "Denúncia excluída.");
      fetchDenuncias();
    } catch (error) {
      console.error("Erro ao excluir denúncia:", error);
      Alert.alert("Erro", "Não foi possível excluir a denúncia.");
    }
  };

  useEffect(() => {
    if (telaAtual === 'Home') {
      fetchDenuncias();
    }
  }, [telaAtual, token]);

  if (telaAtual === 'Login') {
    return <LoginScreen onLogin={handleLogin} onNavigateCadastro={() => setTelaAtual('Cadastro')} />;
  }
  if (telaAtual === 'Cadastro') {
    return <CadastroScreen onNavigateLogin={() => setTelaAtual('Login')} onRegisterSuccess={() => setTelaAtual('Login')} />;
  }
  if (telaAtual === 'Home') {
    return (
      <HomeScreen 
        usuario={usuario}
        onLogout={handleLogout}
        onNavigateNovaDenuncia={() => setTelaAtual('NovaDenuncia')}
        onNavigateEdit={handleNavigateEdit}
        onNavigateEditProfile={() => setTelaAtual('EditProfile')}
        denuncias={denuncias}
        loadingDenuncias={loadingDenuncias}
        onExcluirDenuncia={handleExcluirDenuncia}
        onRefresh={fetchDenuncias}
      />
    );
  }
  if (telaAtual === 'NovaDenuncia') {
    return <NovaDenunciaScreen onBack={() => setTelaAtual('Home')} onDenunciaCriada={() => setTelaAtual('Home')} />;
  }
  if (telaAtual === 'EditDenuncia') {
    return <EditDenunciaScreen onBack={() => setTelaAtual('Home')} onDenunciaEditada={() => setTelaAtual('Home')} denuncia={denunciaParaEditar} />;
  }
  if (telaAtual === 'EditProfile') {
    return (
      <EditProfileScreen 
        onBack={() => setTelaAtual('Home')} 
        onProfileUpdated={handleProfileUpdated} 
        usuario={usuario}
        onNavigateChangePassword={() => setTelaAtual('ChangePassword')}
        onLogout={handleLogout}
      />
    );
  }
  if (telaAtual === 'ChangePassword') {
    return (
      <ChangePasswordScreen 
        onBack={() => setTelaAtual('EditProfile')} 
        onPasswordChanged={() => setTelaAtual('EditProfile')} 
      />
    );
  }
}



// --- 9. ESTILOS FINAIS E CORRIGIDOS ---
const styles = StyleSheet.create({
  // CORREÇÃO: container é edge-to-edge
  container: { 
    flex: 1, 
    backgroundColor: palette.light,
    paddingTop: 10,
    // REMOVIDO: paddingHorizontal (vai para o ScrollView/Headers)
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  // CORREÇÃO: scrollContainer tem o padding
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20, // <-- Padding principal para formulários
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 10,
    color: palette.primary,
  },

  logo: {
    width: 500, // Largura da imagem
    height: 186, // Altura da imagem
    resizeMode: 'contain', // Garante que a imagem caiba
    alignSelf: 'center', // Centraliza a imagem
    marginBottom: 10, // Espaço abaixo do logo
  },

  subtitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    marginBottom: 15,
    marginTop: 10,
    color: palette.text,
    textAlign: 'center',
  },
  label: { 
    fontSize: 16, 
    marginBottom: 8, 
    color: palette.textSecondary,
  },
  infoText: { 
    fontSize: 12, 
    color: palette.textSecondary, 
    textAlign: 'center', 
    marginVertical: 15,
  },
  error: { 
    color: palette.danger, 
    textAlign: 'center', 
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  linkText: { 
    color: palette.primaryLight, 
    textAlign: 'center', 
    marginTop: 20, 
    fontSize: 16,
    fontWeight: '500',
    padding: 10,
  },
  linkTextSmall: {
    color: palette.primaryLight,
    fontSize: 14,
  },
  buttonContainer: { 
    marginTop: 10, 
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: palette.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonPrimaryText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: palette.white,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.primary,
    minHeight: 50,
    marginTop: 10,
  },
  buttonSecondaryText: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // CORREÇÃO: Ícone de Voltar (Texto)
  backButton: {
    paddingTop: 10,
    paddingBottom: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 20, // Padding lateral para o botão de voltar
  },
  backButtonText: {
    color: palette.primary,
    fontSize: 18, 
    fontWeight: 'bold',
  },
  homeHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10,
    paddingTop: 10,
    paddingHorizontal: 20, // Padding lateral para o Header
  },
  homeSubtitle: {
    fontSize: 20, 
    fontWeight: '600', 
    marginBottom: 15,
    marginTop: 10,
    color: palette.text,
    paddingHorizontal: 20, // Padding lateral para o Subtítulo
  },
  homeList: {
    flex: 1,
    // (Não precisa de margem)
  },
  homeListContent: {
    paddingHorizontal: 20, // Padding *dentro* da lista
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: palette.primary,
    flexShrink: 1, // Permite que o nome quebre a linha se for muito grande
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // CORREÇÃO: Botão "Editar Perfil" com fundo
  editProfileButton: {
    backgroundColor: palette.primaryBackground, // Fundo azul claro
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: palette.primary, // Texto azul escuro
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: palette.dangerBackground, // Fundo vermelho claro
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  logoutButtonText: {
    color: palette.danger,
    fontWeight: '600',
  },
  denunciaCard: {
    backgroundColor: palette.white,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  statusBadge: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    padding: 15,
    flex: 1,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 5,
    color: palette.text,
  },
  cardInfo: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 3,
  },
  cardStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptyText: { 
    textAlign: 'center', 
    marginTop: 40, 
    fontSize: 16, 
    color: palette.textSecondary,
  },
  actionsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingTop: 10 
  },
  actionTextEditar: { color: palette.primary, fontWeight: 'bold', marginHorizontal: 10 },
  actionTextExcluir: { color: palette.danger, fontWeight: 'bold', marginHorizontal: 10 },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primary,
    bottom: 30,
    right: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 30,
    color: palette.white,
    lineHeight: 30,
    paddingBottom: 3,
  },
  previewImagem: { 
    width: '100%',
    height: 250, 
    borderRadius: 8, 
    marginTop: 15, 
    marginBottom: 10, 
    backgroundColor: '#eee',
    alignSelf: 'center',
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { 
    width: '90%', 
    backgroundColor: 'white', 
    padding: 25, 
    borderRadius: 10, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 5 
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: palette.text },
  modalText: { fontSize: 16, color: palette.textSecondary, marginBottom: 15 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: palette.white,
  },
  inputPassword: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: palette.text,
  },
  eyeButton: {
    padding: 15,
  },
  eyeButtonText: {
    color: palette.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  input: { 
    height: 50, 
    borderColor: palette.border,
    borderWidth: 1, 
    borderRadius: 8, 
    marginBottom: 15, 
    paddingHorizontal: 15, 
    backgroundColor: palette.white,
    fontSize: 16,
    color: palette.text,
  },
  inputMulti: { 
    height: 120, 
    borderColor: palette.border,
    borderWidth: 1, 
    borderRadius: 8, 
    marginBottom: 15, 
    paddingHorizontal: 15, 
    paddingTop: 15, 
    backgroundColor: palette.white, 
    textAlignVertical: 'top',
    fontSize: 16,
    color: palette.text,
  },
});