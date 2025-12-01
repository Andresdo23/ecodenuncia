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
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Configuração da API
const API_URL = 'https://ecodenuncia.onrender.com/api';
const api = axios.create({ baseURL: API_URL });

// Design System
const COLORS = {
  primary: '#005A9C',
  primaryLight: '#007bff',
  success: '#28a745',
  danger: '#DC3545',
  warning: '#FFC107',
  light: '#F4F7F6',
  white: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  gray: '#ced4da',
  border: '#B0B0B0',
  primaryBackground: '#e6f0f7',
  dangerBackground: '#fbeeee',
};

// ==============================================================================
// TELAS DE AUTENTICAÇÃO
// ==============================================================================

const LoginScreen = ({ onLogin, onNavigateCadastro }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) return setError('Email e senha são obrigatórios.');
    
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data.data;

      if (usuario.tipo_usuario === 'cidadao') {
        onLogin(token, usuario);
      } else {
        setError('Acesso negado. Este app é apenas para Cidadãos.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro de conexão ou credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.light} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text style={styles.subtitle}>Login do Cidadão</Text>
          
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            value={email} onChangeText={setEmail} 
            keyboardType="email-address" autoCapitalize="none" 
            placeholder="seu@email.com" placeholderTextColor={COLORS.textSecondary}
          />
          
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.inputPassword} 
              value={senha} onChangeText={setSenha} 
              secureTextEntry={!mostrarSenha} 
              autoCapitalize="none" 
              placeholder="Sua senha" placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeButton}>
              <Text style={styles.eyeButtonText}>{mostrarSenha ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.buttonPrimaryText}>Entrar</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onNavigateCadastro}>
            <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const CadastroScreen = ({ onNavigateLogin, onRegisterSuccess }) => {
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', telefone: '', dataNascimento: '', senha: '', confirmarSenha: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateForm = (key, value) => setForm({ ...form, [key]: value });
  const validateEmail = (email) => String(email).toLowerCase().match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);

  const handleRegister = async () => {
    setError('');
    const { nome, email, senha, confirmarSenha, cpf, telefone, dataNascimento } = form;

    if (!nome || !email || !senha || !confirmarSenha || !cpf || !telefone || !dataNascimento) return setError('Todos os campos são obrigatórios.');
    if (!validateEmail(email)) return setError('Insira um e-mail válido.');
    if (senha !== confirmarSenha) return setError('As senhas não coincidem.');
    if (senha.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');

    setLoading(true);
    try {
      await api.post('/auth/register', { 
        nome, email, senha, tipo_usuario: 'cidadao',
        data_nascimento: dataNascimento, telefone, cpf
      });
      Alert.alert("Sucesso!", "Conta criada. Por favor, faça login.", [{ text: "OK", onPress: onRegisterSuccess }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onNavigateLogin}>
          <Text style={styles.backButtonText}>‹ Voltar</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text style={styles.subtitle}>Criar Conta</Text>
          
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput style={styles.input} value={form.nome} onChangeText={(t) => updateForm('nome', t)} placeholder="Seu nome" placeholderTextColor={COLORS.textSecondary} />
          
          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} value={form.email} onChangeText={(t) => updateForm('email', t)} keyboardType="email-address" autoCapitalize="none" placeholder="seu@email.com" placeholderTextColor={COLORS.textSecondary} />
          
          <Text style={styles.label}>CPF *</Text>
          <TextInput style={styles.input} value={form.cpf} onChangeText={(t) => updateForm('cpf', t)} keyboardType="numeric" placeholder="111.222.333-44" placeholderTextColor={COLORS.textSecondary} />
          
          <Text style={styles.label}>Telefone *</Text>
          <TextInput style={styles.input} value={form.telefone} onChangeText={(t) => updateForm('telefone', t)} keyboardType="phone-pad" placeholder="(XX) 9XXXX-XXXX" placeholderTextColor={COLORS.textSecondary} />
          
          <Text style={styles.label}>Data de Nascimento *</Text>
          <TextInput style={styles.input} value={form.dataNascimento} onChangeText={(t) => updateForm('dataNascimento', t)} placeholder="DD/MM/AAAA" placeholderTextColor={COLORS.textSecondary} />
          
          <Text style={styles.label}>Senha *</Text>
          <View style={styles.passwordContainer}>
            <TextInput style={styles.inputPassword} value={form.senha} onChangeText={(t) => updateForm('senha', t)} secureTextEntry={!mostrarSenha} autoCapitalize="none" placeholder="Mínimo 6 caracteres" placeholderTextColor={COLORS.textSecondary} />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeButton}>
              <Text style={styles.eyeButtonText}>{mostrarSenha ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Confirmar Senha *</Text>
          <View style={styles.passwordContainer}>
            <TextInput style={styles.inputPassword} value={form.confirmarSenha} onChangeText={(t) => updateForm('confirmarSenha', t)} secureTextEntry={!mostrarSenha} autoCapitalize="none" placeholder="Repita a senha" placeholderTextColor={COLORS.textSecondary} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.buttonPrimaryText}>Criar Conta</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ==============================================================================
// TELAS PRINCIPAIS (LOGADO)
// ==============================================================================

const HomeScreen = ({ usuario, onLogout, onNavigateNovaDenuncia, onNavigateEdit, onNavigateEditProfile, denuncias, loadingDenuncias, onExcluirDenuncia, onRefresh }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [motivoExclusao, setMotivoExclusao] = useState('');
  const [denunciaParaExcluir, setDenunciaParaExcluir] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleExcluirPress = (denuncia) => { setDenunciaParaExcluir(denuncia); setModalVisible(true); };
  
  const handleConfirmarExclusao = () => {
    if (!motivoExclusao) return Alert.alert("Erro", "O motivo da exclusão é obrigatório.");
    onExcluirDenuncia(denunciaParaExcluir.id, motivoExclusao);
    setModalVisible(false); setMotivoExclusao(''); setDenunciaParaExcluir(null);
  };

  const onPullToRefresh = async () => { setRefreshing(true); await onRefresh(); setRefreshing(false); };
  
  const getStatusStyle = (status) => {
    const map = {
      'Resolvida': { color: COLORS.success, badge: COLORS.success },
      'Em Análise': { color: COLORS.warning, badge: COLORS.warning },
      'Recebida': { color: COLORS.danger, badge: COLORS.danger }
    };
    return map[status] || { color: COLORS.textSecondary, badge: COLORS.gray };
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.nome_status);
    return (
      <View style={styles.denunciaCard}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.badge }]} />
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Denúncia</Text>
            <Text style={styles.modalText}>Por favor, informe o motivo da exclusão:</Text>
            <TextInput style={[styles.input, { marginHorizontal: 0 }]} placeholder="Motivo (ex: duplicada)" placeholderTextColor={COLORS.textSecondary} value={motivoExclusao} onChangeText={setMotivoExclusao} />
            <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: COLORS.danger }]} onPress={handleConfirmarExclusao}>
              <Text style={styles.buttonPrimaryText}>Confirmar Exclusão</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.homeHeader}>
        <Text style={styles.headerTitle}>Olá, {usuario?.nome?.split(' ')[0]}!</Text>
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
          style={styles.flex1} 
          contentContainerStyle={styles.homeListContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullToRefresh} tintColor={COLORS.primary} />}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullToRefresh} tintColor={COLORS.primary} />}>
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

const NovaDenunciaScreen = ({ onBack, onDenunciaCriada }) => {
  const [form, setForm] = useState({ descricao: '', endereco: '', referencia: '' });
  const [imagem, setImagem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const handleMedia = async (type) => {
    const permFn = type === 'camera' ? ImagePicker.requestCameraPermissionsAsync : ImagePicker.requestMediaLibraryPermissionsAsync;
    const launchFn = type === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    
    const { status } = await permFn();
    if (status !== 'granted') return Alert.alert('Permissão negada', `Precisamos de acesso à ${type === 'camera' ? 'câmera' : 'galeria'}.`);
    
    const result = await launchFn({ quality: 0.7 });
    if (!result.canceled) setImagem(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!imagem || !form.descricao || !form.endereco) return Alert.alert("Campos Obrigatórios", "Descrição, Endereço e Foto são obrigatórios.");
    
    setIsSubmitting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Precisamos da sua localização.');

      const location = await Location.getCurrentPositionAsync({});
      const formData = new FormData();
      formData.append('image', { uri: imagem.uri, name: `denuncia_${Date.now()}.jpg`, type: 'image/jpeg' });

      const uploadRes = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await api.post('/denuncias', { 
        descricao: form.descricao, url_foto: uploadRes.data.data.url, 
        latitude: location.coords.latitude, longitude: location.coords.longitude, 
        endereco_completo: form.endereco, ponto_referencia: form.referencia 
      });

      Alert.alert("Sucesso!", "Sua denúncia foi enviada.");
      onDenunciaCriada();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", error.message || "Não foi possível enviar sua denúncia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>‹ Voltar</Text></TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Nova Denúncia</Text>
          
          <Text style={styles.label}>Descrição *</Text>
          <TextInput style={styles.inputMulti} value={form.descricao} onChangeText={(t) => updateForm('descricao', t)} placeholder="Ex: Sofá abandonado" placeholderTextColor={COLORS.textSecondary} multiline />
          
          <Text style={styles.label}>Endereço Completo *</Text>
          <TextInput style={styles.input} value={form.endereco} onChangeText={(t) => updateForm('endereco', t)} placeholder="Rua, Número, Bairro" placeholderTextColor={COLORS.textSecondary} />
          
          <Text style={styles.label}>Ponto de Referência</Text>
          <TextInput style={styles.input} value={form.referencia} onChangeText={(t) => updateForm('referencia', t)} placeholder="Opcional" placeholderTextColor={COLORS.textSecondary} />
          
          <Text style={styles.label}>Foto *</Text>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => handleMedia('camera')}><Text style={styles.buttonSecondaryText}>Tirar Foto</Text></TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => handleMedia('gallery')}><Text style={styles.buttonSecondaryText}>Escolher da Galeria</Text></TouchableOpacity>
          
          {imagem && <Image source={{ uri: imagem.uri }} style={styles.previewImagem} />}
          
          <View style={styles.buttonContainer}>
            {isSubmitting ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}><Text style={styles.buttonPrimaryText}>Enviar Denúncia</Text></TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const EditDenunciaScreen = ({ onBack, onDenunciaEditada, denuncia }) => {
  const [form, setForm] = useState({ descricao: denuncia.descricao || '', endereco: denuncia.endereco_completo || '', referencia: denuncia.ponto_referencia || '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    if (!form.descricao || !form.endereco) return Alert.alert("Erro", "Descrição e Endereço são obrigatórios.");
    setIsSubmitting(true);
    try {
      await api.put(`/denuncias/${denuncia.id}`, { descricao: form.descricao, endereco_completo: form.endereco, ponto_referencia: form.referencia });
      Alert.alert("Sucesso!", "Sua denúncia foi atualizada.");
      onDenunciaEditada();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar sua denúncia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>‹ Voltar</Text></TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Editar Denúncia</Text>
        <Text style={styles.label}>Descrição *</Text>
        <TextInput style={styles.inputMulti} value={form.descricao} onChangeText={(t) => updateForm('descricao', t)} multiline />
        <Text style={styles.label}>Endereço Completo *</Text>
        <TextInput style={styles.input} value={form.endereco} onChangeText={(t) => updateForm('endereco', t)} />
        <Text style={styles.label}>Ponto de Referência</Text>
        <TextInput style={styles.input} value={form.referencia} onChangeText={(t) => updateForm('referencia', t)} />
        <Text style={styles.infoText}>Nota: A foto e a localização não podem ser editadas.</Text>
        <View style={styles.buttonContainer}>
          {isSubmitting ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}><Text style={styles.buttonPrimaryText}>Salvar Alterações</Text></TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const EditProfileScreen = ({ onBack, onProfileUpdated, usuario, onNavigateChangePassword, onLogout }) => {
  const [form, setForm] = useState({ email: usuario?.email || '', telefone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleSubmit = async () => {
    if (!form.email) return Alert.alert("Erro", "O e-mail não pode ficar em branco.");
    setIsSubmitting(true);
    try {
      const response = await api.put('/users/me', form);
      Alert.alert("Sucesso!", "Seu perfil foi atualizado.");
      onProfileUpdated(response.data.data);
    } catch (error) {
      Alert.alert("Erro", error.response?.data?.error || 'Não foi possível atualizar seu perfil.');
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteAccount = async () => {
    if (!senhaConfirm) return Alert.alert("Erro", "Digite sua senha.");
    setLoadingDelete(true);
    try {
      await api.delete('/users/me', { data: { senha: senhaConfirm } });
      Alert.alert("Conta Excluída", "A sua conta foi desativada.");
      setModalVisible(false);
      onLogout();
    } catch (error) {
      Alert.alert("Erro", error.response?.data?.error || 'Não foi possível excluir.');
    } finally { setLoadingDelete(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Conta?</Text>
            <Text style={styles.modalText}>Confirme com sua senha:</Text>
            <TextInput style={styles.input} placeholder="Sua senha" secureTextEntry value={senhaConfirm} onChangeText={setSenhaConfirm} />
            <TouchableOpacity style={[styles.buttonPrimary, { backgroundColor: COLORS.danger }]} onPress={handleDeleteAccount} disabled={loadingDelete}>
              {loadingDelete ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonPrimaryText}>Confirmar Exclusão</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={() => setModalVisible(false)}><Text style={styles.buttonSecondaryText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>‹ Voltar</Text></TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Editar Perfil</Text>
        <Text style={styles.label}>Email:</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={(t) => setForm({...form, email: t})} keyboardType="email-address" />
        <Text style={styles.label}>Telefone:</Text>
        <TextInput style={styles.input} value={form.telefone} onChangeText={(t) => setForm({...form, telefone: t})} keyboardType="phone-pad" placeholder="(XX) 9XXXX-XXXX" />
        
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonPrimaryText}>Salvar Perfil</Text>}
        </TouchableOpacity>
        
        <Text style={styles.infoText}>--- Segurança ---</Text>
        <TouchableOpacity style={styles.buttonSecondary} onPress={onNavigateChangePassword}><Text style={styles.buttonSecondaryText}>Mudar Senha</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.buttonSecondary, { borderColor: COLORS.danger, marginTop: 20 }]} onPress={() => setModalVisible(true)}>
          <Text style={[styles.buttonSecondaryText, { color: COLORS.danger }]}>Excluir Minha Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const ChangePasswordScreen = ({ onBack, onPasswordChanged }) => {
  const [form, setForm] = useState({ atual: '', nova: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    const { atual, nova, confirm } = form;
    if (!atual || !nova || !confirm) return setError('Todos os campos são obrigatórios.');
    if (nova !== confirm) return setError('As novas senhas não coincidem.');
    if (nova.length < 6) return setError('A nova senha deve ter 6 caracteres.');

    setIsSubmitting(true);
    try {
      await api.put('/users/me/password', { senhaAtual: atual, novaSenha: nova });
      Alert.alert("Sucesso!", "Senha alterada.", [{ text: "OK", onPress: onPasswordChanged }]);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao alterar senha.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>‹ Voltar</Text></TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Mudar Senha</Text>
        <Text style={styles.label}>Senha Atual *</Text>
        <TextInput style={styles.input} secureTextEntry value={form.atual} onChangeText={(t) => setForm({...form, atual: t})} />
        <Text style={styles.label}>Nova Senha *</Text>
        <TextInput style={styles.input} secureTextEntry value={form.nova} onChangeText={(t) => setForm({...form, nova: t})} />
        <Text style={styles.label}>Confirmar Nova Senha *</Text>
        <TextInput style={styles.input} secureTextEntry value={form.confirm} onChangeText={(t) => setForm({...form, confirm: t})} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonPrimaryText}>Salvar Nova Senha</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ==============================================================================
// APP MAIN (ROUTER)
// ==============================================================================

export default function App() {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [telaAtual, setTelaAtual] = useState('Login');
  const [denunciaParaEditar, setDenunciaParaEditar] = useState(null);
  const [denuncias, setDenuncias] = useState([]);
  const [loadingDenuncias, setLoadingDenuncias] = useState(false);

  const handleLogin = (t, u) => {
    setToken(t); setUsuario(u);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setTelaAtual('Home');
  };

  const handleLogout = () => {
    setToken(null); setUsuario(null); setDenuncias([]);
    delete api.defaults.headers.common['Authorization'];
    setTelaAtual('Login');
  };

  const fetchDenuncias = async () => {
    if (!token) return;
    setLoadingDenuncias(true);
    try {
      const response = await api.get('/denuncias');
      setDenuncias(response.data.data);
    } catch (e) { Alert.alert("Erro", "Falha ao carregar histórico."); } 
    finally { setLoadingDenuncias(false); }
  };

  const handleExcluirDenuncia = async (id, motivo) => {
    try {
      await api.put(`/denuncias/${id}/excluir`, { motivo });
      Alert.alert("Sucesso", "Denúncia excluída.");
      fetchDenuncias();
    } catch (e) { Alert.alert("Erro", "Falha ao excluir."); }
  };

  useEffect(() => { if (telaAtual === 'Home') fetchDenuncias(); }, [telaAtual, token]);

  // Roteamento Simples
  switch (telaAtual) {
    case 'Login': return <LoginScreen onLogin={handleLogin} onNavigateCadastro={() => setTelaAtual('Cadastro')} />;
    case 'Cadastro': return <CadastroScreen onNavigateLogin={() => setTelaAtual('Login')} onRegisterSuccess={() => setTelaAtual('Login')} />;
    case 'Home': return <HomeScreen usuario={usuario} onLogout={handleLogout} onNavigateNovaDenuncia={() => setTelaAtual('NovaDenuncia')} onNavigateEdit={(d) => { setDenunciaParaEditar(d); setTelaAtual('EditDenuncia'); }} onNavigateEditProfile={() => setTelaAtual('EditProfile')} denuncias={denuncias} loadingDenuncias={loadingDenuncias} onExcluirDenuncia={handleExcluirDenuncia} onRefresh={fetchDenuncias} />;
    case 'NovaDenuncia': return <NovaDenunciaScreen onBack={() => setTelaAtual('Home')} onDenunciaCriada={() => setTelaAtual('Home')} />;
    case 'EditDenuncia': return <EditDenunciaScreen onBack={() => setTelaAtual('Home')} onDenunciaEditada={() => setTelaAtual('Home')} denuncia={denunciaParaEditar} />;
    case 'EditProfile': return <EditProfileScreen onBack={() => setTelaAtual('Home')} onProfileUpdated={(u) => { setUsuario(u); setTelaAtual('Home'); }} usuario={usuario} onNavigateChangePassword={() => setTelaAtual('ChangePassword')} onLogout={handleLogout} />;
    case 'ChangePassword': return <ChangePasswordScreen onBack={() => setTelaAtual('EditProfile')} onPasswordChanged={() => setTelaAtual('EditProfile')} />;
    default: return <LoginScreen onLogin={handleLogin} />;
  }
}

// ==============================================================================
// ESTILOS GLOBAIS
// ==============================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light, paddingTop: 10 },
  flex1: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  
  // Tipografia
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: COLORS.primary },
  subtitle: { fontSize: 20, fontWeight: '600', marginBottom: 15, marginTop: 10, color: COLORS.text, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 8, color: COLORS.textSecondary },
  infoText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginVertical: 15 },
  error: { color: COLORS.danger, textAlign: 'center', marginBottom: 10, fontSize: 14, fontWeight: '500' },
  
  // Imagens
  logo: { width: 500, height: 186, resizeMode: 'contain', alignSelf: 'center', marginBottom: 10 },
  previewImagem: { width: '100%', height: 250, borderRadius: 8, marginTop: 15, marginBottom: 10, backgroundColor: '#eee', alignSelf: 'center' },

  // Inputs
  input: { height: 50, borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15, backgroundColor: COLORS.white, fontSize: 16, color: COLORS.text },
  inputMulti: { height: 120, borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15, paddingTop: 15, backgroundColor: COLORS.white, textAlignVertical: 'top', fontSize: 16, color: COLORS.text },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, marginBottom: 15, backgroundColor: COLORS.white },
  inputPassword: { flex: 1, height: 50, paddingHorizontal: 15, fontSize: 16, color: COLORS.text },
  
  // Botões
  buttonContainer: { marginTop: 10, marginBottom: 10 },
  buttonPrimary: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  buttonPrimaryText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  buttonSecondary: { backgroundColor: COLORS.white, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary, minHeight: 50, marginTop: 10 },
  buttonSecondaryText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  backButton: { paddingTop: 10, paddingBottom: 5, alignSelf: 'flex-start', paddingHorizontal: 20 },
  backButtonText: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold' },
  eyeButton: { padding: 15 },
  eyeButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  linkText: { color: COLORS.primaryLight, textAlign: 'center', marginTop: 20, fontSize: 16, fontWeight: '500', padding: 10 },
  fab: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, bottom: 30, right: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  fabText: { fontSize: 30, color: COLORS.white, lineHeight: 30, paddingBottom: 3 },

  // Home & Header
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingTop: 10, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, flexShrink: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  homeSubtitle: { fontSize: 20, fontWeight: '600', marginBottom: 15, marginTop: 10, color: COLORS.text, paddingHorizontal: 20 },
  editProfileButton: { backgroundColor: COLORS.primaryBackground, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  editProfileButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  logoutButton: { backgroundColor: COLORS.dangerBackground, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginLeft: 10 },
  logoutButtonText: { color: COLORS.danger, fontWeight: '600' },
  
  // Cards da Lista
  homeListContent: { paddingHorizontal: 20, paddingBottom: 100 },
  denunciaCard: { backgroundColor: COLORS.white, borderRadius: 8, marginBottom: 12, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, overflow: 'hidden' },
  statusBadge: { width: 6, height: '100%' },
  cardContent: { padding: 15, flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 5, color: COLORS.text },
  cardInfo: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 3 },
  cardStatus: { fontSize: 15, fontWeight: 'bold', marginTop: 5 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  actionTextEditar: { color: COLORS.primary, fontWeight: 'bold', marginHorizontal: 10 },
  actionTextExcluir: { color: COLORS.danger, fontWeight: 'bold', marginHorizontal: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: COLORS.textSecondary },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { width: '90%', backgroundColor: 'white', padding: 25, borderRadius: 10, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: COLORS.text },
  modalText: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 15 },
});