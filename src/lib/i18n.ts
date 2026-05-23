// Supported locales
export type Locale = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh'

export const SUPPORTED_LOCALES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  hi: 'हिन्दी',
  zh: '中文',
}

type Translations = {
  // Navigation
  dashboard: string
  apps: string
  settings: string
  logout: string
  login: string
  signup: string
  // App actions
  createApp: string
  editApp: string
  deleteApp: string
  viewApp: string
  // Common
  save: string
  cancel: string
  delete: string
  edit: string
  add: string
  search: string
  filter: string
  loading: string
  error: string
  success: string
  noData: string
  // Table
  id: string
  createdAt: string
  updatedAt: string
  actions: string
  // Forms
  name: string
  description: string
  email: string
  password: string
  confirm: string
  // Import/Export
  importCsv: string
  exportGithub: string
  importSuccess: string
  exportSuccess: string
}

const translations: Record<Locale, Translations> = {
  en: {
    dashboard: 'Dashboard',
    apps: 'Apps',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    createApp: 'Create App',
    editApp: 'Edit App',
    deleteApp: 'Delete App',
    viewApp: 'View App',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noData: 'No data found',
    id: 'ID',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    actions: 'Actions',
    name: 'Name',
    description: 'Description',
    email: 'Email',
    password: 'Password',
    confirm: 'Confirm',
    importCsv: 'Import CSV',
    exportGithub: 'Export to GitHub',
    importSuccess: 'Data imported successfully',
    exportSuccess: 'App exported to GitHub successfully',
  },
  es: {
    dashboard: 'Panel',
    apps: 'Aplicaciones',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    createApp: 'Crear aplicación',
    editApp: 'Editar aplicación',
    deleteApp: 'Eliminar aplicación',
    viewApp: 'Ver aplicación',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    search: 'Buscar',
    filter: 'Filtrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    noData: 'No se encontraron datos',
    id: 'ID',
    createdAt: 'Creado el',
    updatedAt: 'Actualizado el',
    actions: 'Acciones',
    name: 'Nombre',
    description: 'Descripción',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirm: 'Confirmar',
    importCsv: 'Importar CSV',
    exportGithub: 'Exportar a GitHub',
    importSuccess: 'Datos importados correctamente',
    exportSuccess: 'Aplicación exportada a GitHub correctamente',
  },
  fr: {
    dashboard: 'Tableau de bord',
    apps: 'Applications',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    login: 'Connexion',
    signup: "S'inscrire",
    createApp: 'Créer une application',
    editApp: "Modifier l'application",
    deleteApp: "Supprimer l'application",
    viewApp: "Voir l'application",
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    noData: 'Aucune donnée trouvée',
    id: 'ID',
    createdAt: 'Créé le',
    updatedAt: 'Mis à jour le',
    actions: 'Actions',
    name: 'Nom',
    description: 'Description',
    email: 'E-mail',
    password: 'Mot de passe',
    confirm: 'Confirmer',
    importCsv: 'Importer CSV',
    exportGithub: 'Exporter vers GitHub',
    importSuccess: 'Données importées avec succès',
    exportSuccess: 'Application exportée vers GitHub avec succès',
  },
  de: {
    dashboard: 'Dashboard',
    apps: 'Apps',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    login: 'Anmelden',
    signup: 'Registrieren',
    createApp: 'App erstellen',
    editApp: 'App bearbeiten',
    deleteApp: 'App löschen',
    viewApp: 'App ansehen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    search: 'Suchen',
    filter: 'Filtern',
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg',
    noData: 'Keine Daten gefunden',
    id: 'ID',
    createdAt: 'Erstellt am',
    updatedAt: 'Aktualisiert am',
    actions: 'Aktionen',
    name: 'Name',
    description: 'Beschreibung',
    email: 'E-Mail',
    password: 'Passwort',
    confirm: 'Bestätigen',
    importCsv: 'CSV importieren',
    exportGithub: 'Nach GitHub exportieren',
    importSuccess: 'Daten erfolgreich importiert',
    exportSuccess: 'App erfolgreich nach GitHub exportiert',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    apps: 'ऐप्स',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    login: 'लॉग इन',
    signup: 'साइन अप',
    createApp: 'ऐप बनाएं',
    editApp: 'ऐप संपादित करें',
    deleteApp: 'ऐप हटाएं',
    viewApp: 'ऐप देखें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    add: 'जोड़ें',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    noData: 'कोई डेटा नहीं मिला',
    id: 'आईडी',
    createdAt: 'बनाया गया',
    updatedAt: 'अपडेट किया गया',
    actions: 'कार्रवाइयां',
    name: 'नाम',
    description: 'विवरण',
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirm: 'पुष्टि करें',
    importCsv: 'CSV आयात करें',
    exportGithub: 'GitHub पर निर्यात करें',
    importSuccess: 'डेटा सफलतापूर्वक आयात किया गया',
    exportSuccess: 'ऐप सफलतापूर्वक GitHub पर निर्यात किया गया',
  },
  zh: {
    dashboard: '仪表板',
    apps: '应用',
    settings: '设置',
    logout: '退出',
    login: '登录',
    signup: '注册',
    createApp: '创建应用',
    editApp: '编辑应用',
    deleteApp: '删除应用',
    viewApp: '查看应用',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    filter: '筛选',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    noData: '未找到数据',
    id: 'ID',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    actions: '操作',
    name: '名称',
    description: '描述',
    email: '邮箱',
    password: '密码',
    confirm: '确认',
    importCsv: '导入CSV',
    exportGithub: '导出到GitHub',
    importSuccess: '数据导入成功',
    exportSuccess: '应用已成功导出到GitHub',
  },
}

export function getTranslations(locale: string): Translations {
  return translations[(locale as Locale) ?? 'en'] ?? translations.en
}

export function t(locale: string, key: keyof Translations): string {
  return getTranslations(locale)[key] ?? key
}
