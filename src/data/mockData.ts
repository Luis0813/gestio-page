import type { Product, RawMaterial, Expense, WorkerPayroll, StockMovement, Customer } from '../types';

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  // Empanadas Raw Materials
  { id: 'rm-1', name: 'Harina de Trigo Precoz', unit: 'Kg', currentStock: 85, costPerUnit: 1.2, supplier: 'Molinos del Valle', minStockAlert: 20, lastRestockDate: '2026-08-15' },
  { id: 'rm-2', name: 'Carne Molida de Res (Corte Primera)', unit: 'Kg', currentStock: 30, costPerUnit: 6.5, supplier: 'Carnes San José', minStockAlert: 10, lastRestockDate: '2026-08-18' },
  { id: 'rm-3', name: 'Queso Mozzarella Rayado', unit: 'Kg', currentStock: 25, costPerUnit: 5.8, supplier: 'Lácteos Andes', minStockAlert: 8, lastRestockDate: '2026-08-20' },
  { id: 'rm-4', name: 'Aceite Vegetal para Freír', unit: 'Litros', currentStock: 40, costPerUnit: 2.1, supplier: 'Distribuidora Central', minStockAlert: 15, lastRestockDate: '2026-08-10' },
  { id: 'rm-5', name: 'Cebolla y Aliños Preparados', unit: 'Kg', currentStock: 18, costPerUnit: 1.5, supplier: 'Mercado Mayorista', minStockAlert: 5, lastRestockDate: '2026-08-21' },

  // Clothing / Textile Raw Materials
  { id: 'rm-6', name: 'Tela Algodón 100% Pima', unit: 'Metros', currentStock: 150, costPerUnit: 4.5, supplier: 'Textiles El Globo', minStockAlert: 30, lastRestockDate: '2026-08-01' },
  { id: 'rm-7', name: 'Hilo de Costura Reforzado Black/White', unit: 'Unidades', currentStock: 50, costPerUnit: 0.8, supplier: 'Insumos Costura SA', minStockAlert: 15, lastRestockDate: '2026-08-05' },

  // Hardware Raw Materials
  { id: 'rm-8', name: 'Varilla de Acero 1/2"', unit: 'Metros', currentStock: 300, costPerUnit: 3.2, supplier: 'Aceros Industriales', minStockAlert: 50, lastRestockDate: '2026-08-12' },
];

export const INITIAL_PRODUCTS: Product[] = [
  // EMPANADAS DOMAIN
  {
    id: 'prod-emp-1',
    name: 'Empanada de Carne Tradicional',
    sku: 'EMP-CARNE-01',
    category: 'Empanadas Fritas',
    businessDomain: 'empanadas',
    stock: 140,
    minStockAlert: 30,
    costPrice: 0.65, // Derived from flour + meat + oil + spices
    salePrice: 1.80,
    unit: 'Unidad',
    customAttributes: {
      'Tiempo de Fritura': '4 mins',
      'Picante': 'Suave',
      'Lote Producción': 'LOTE-2026-0822',
      'Temperatura Óptima': '180°C'
    },
    rawMaterialRecipe: [
      { rawMaterialId: 'rm-1', quantityNeeded: 0.08 }, // 80g harina
      { rawMaterialId: 'rm-2', quantityNeeded: 0.06 }, // 60g carne
      { rawMaterialId: 'rm-4', quantityNeeded: 0.02 }, // 20ml aceite
      { rawMaterialId: 'rm-5', quantityNeeded: 0.01 }  // 10g aliño
    ]
  },
  {
    id: 'prod-emp-2',
    name: 'Empanada Queso Mozzarella y Maíz',
    sku: 'EMP-QUESO-02',
    category: 'Empanadas Fritas',
    businessDomain: 'empanadas',
    stock: 95,
    minStockAlert: 25,
    costPrice: 0.55,
    salePrice: 1.60,
    unit: 'Unidad',
    customAttributes: {
      'Tiempo de Fritura': '3.5 mins',
      'Picante': 'No',
      'Lote Producción': 'LOTE-2026-0822',
      'Relleno': 'Doble Queso Mozzarella'
    },
    rawMaterialRecipe: [
      { rawMaterialId: 'rm-1', quantityNeeded: 0.08 },
      { rawMaterialId: 'rm-3', quantityNeeded: 0.05 },
      { rawMaterialId: 'rm-4', quantityNeeded: 0.02 }
    ]
  },
  {
    id: 'prod-emp-3',
    name: 'Combo 6 Empanadas + Bebida',
    sku: 'EMP-COMBO-06',
    category: 'Combos & Promociones',
    businessDomain: 'empanadas',
    stock: 40,
    minStockAlert: 10,
    costPrice: 3.40,
    salePrice: 9.50,
    unit: 'Combo',
    customAttributes: {
      'Incluye Bebida': 'Sí (500ml)',
      'Descuento': '15%',
      'Lote Producción': 'LOTE-2026-0822'
    },
    rawMaterialRecipe: [
      { rawMaterialId: 'rm-1', quantityNeeded: 0.48 },
      { rawMaterialId: 'rm-2', quantityNeeded: 0.36 },
      { rawMaterialId: 'rm-4', quantityNeeded: 0.12 }
    ]
  },

  // ROPA / TEXTIL DOMAIN
  {
    id: 'prod-ropa-1',
    name: 'Camiseta Básica Algodón',
    sku: 'ROP-CAM-01',
    category: 'Camisetas',
    businessDomain: 'ropa',
    stock: 200,
    minStockAlert: 50,
    costPrice: 8.50,
    salePrice: 25.00,
    unit: 'Unidad',
    customAttributes: {
      'Talla': 'M',
      'Color': 'Blanco',
      'Material': 'Algodón 100%'
    }
  },
  {
    id: 'prod-ropa-2',
    name: 'Pantalón Jean Slim Fit',
    sku: 'ROP-PAN-01',
    category: 'Pantalones',
    businessDomain: 'ropa',
    stock: 80,
    minStockAlert: 20,
    costPrice: 18.00,
    salePrice: 55.00,
    unit: 'Unidad',
    customAttributes: {
      'Talla': '32',
      'Color': 'Azul Oscuro',
      'Material': 'Denim'
    }
  },

  // FERRETERÍA DOMAIN
  {
    id: 'prod-fer-1',
    name: 'Varilla de Acero 1/2" x 6m',
    sku: 'FER-VAR-01',
    category: 'Acero',
    businessDomain: 'ferreteria',
    stock: 150,
    minStockAlert: 30,
    costPrice: 12.00,
    salePrice: 22.00,
    unit: 'Unidad',
    customAttributes: {
      'Diámetro': '1/2"',
      'Longitud': '6m',
      'Tipo': 'Acero Grado 60'
    }
  },
  {
    id: 'prod-fer-2',
    name: 'Saco de Cemento 50kg',
    sku: 'FER-CEM-01',
    category: 'Cemento',
    businessDomain: 'ferreteria',
    stock: 300,
    minStockAlert: 50,
    costPrice: 9.50,
    salePrice: 16.00,
    unit: 'Saco',
    customAttributes: {
      'Peso': '50kg',
      'Tipo': 'Portland Tipo I'
    }
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cli-1',
    name: 'Juan Pérez',
    phone: '+593 99 123 4567',
    email: 'juan.perez@email.com',
    address: 'Av. Amazonas 123 y Colón',
    totalOrders: 12,
    totalSpent: 245.50,
    lastOrderDate: '2026-08-22',
    notes: 'Cliente recurrente - compra combos los fines de semana'
  },
  {
    id: 'cli-2',
    name: 'Constructora El Pilar',
    phone: '+593 98 765 4321',
    email: 'compras@elpilar.com',
    address: 'Zona Industrial Lote 4',
    totalOrders: 8,
    totalSpent: 850.00,
    lastOrderDate: '2026-08-20',
    notes: 'Comprador al por mayor de materiales y ferretería'
  },
  {
    id: 'cli-3',
    name: 'Carolina Benítez',
    phone: '+593 99 888 7777',
    email: 'caro.benitez@gmail.com',
    address: 'Calle Los Olivos #45',
    totalOrders: 5,
    totalSpent: 165.00,
    lastOrderDate: '2026-08-19',
    notes: 'Cliente de ropa y combos familiares'
  },
  {
    id: 'cli-4',
    name: 'Roberto Gómez',
    phone: '+593 97 111 2222',
    email: 'roberto.gomez@hotmail.com',
    address: 'Urbanización El Bosque',
    totalOrders: 3,
    totalSpent: 95.00,
    lastOrderDate: '2026-08-18',
    notes: 'Pedidos para eventos corporativos'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', description: 'Alquiler del Local', category: 'Alquiler', amount: 1500.00, date: '2026-08-01', periodicity: 'Mensual' },
  { id: 'exp-2', description: 'Servicio de Luz', category: 'Servicios', amount: 120.50, date: '2026-08-05', periodicity: 'Mensual' },
  { id: 'exp-3', description: 'Servicio de Agua', category: 'Servicios', amount: 45.00, date: '2026-08-05', periodicity: 'Mensual' },
  { id: 'exp-4', description: 'Publicidad en Redes Sociales', category: 'Marketing', amount: 200.00, date: '2026-08-10', periodicity: 'Único' },
  { id: 'exp-5', description: 'Mantenimiento de Equipos', category: 'Mantenimiento', amount: 350.00, date: '2026-08-15', periodicity: 'Único' },
  { id: 'exp-6', description: 'Impuesto Municipal', category: 'Impuestos', amount: 180.00, date: '2026-08-20', periodicity: 'Mensual' },
];

export const INITIAL_PAYROLL: WorkerPayroll[] = [
  { id: 'pay-1', workerName: 'María González', role: 'Cocinero', paymentType: 'Fijo Mensual', baseRate: 800, quantityOrHoursCompleted: 1, totalPaid: 800, paymentDate: '2026-08-30', status: 'Pendiente' },
  { id: 'pay-2', workerName: 'Carlos Ruiz', role: 'Vendedor', paymentType: 'Fijo Quincenal', baseRate: 400, quantityOrHoursCompleted: 1, totalPaid: 400, paymentDate: '2026-08-15', status: 'Pagado' },
  { id: 'pay-3', workerName: 'Ana Martínez', role: 'Obrero de Producción', paymentType: 'Por Obra / Destajo', baseRate: 0.15, quantityOrHoursCompleted: 1200, totalPaid: 180, paymentDate: '2026-08-20', status: 'Pagado', notes: 'Pago por 1200 empanadas producidas' },
  { id: 'pay-4', workerName: 'Luis Hernández', role: 'Supervisor', paymentType: 'Fijo Mensual', baseRate: 1200, quantityOrHoursCompleted: 1, totalPaid: 1200, paymentDate: '2026-08-30', status: 'Pendiente' },
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  { id: 'mov-1', productId: 'prod-emp-1', productName: 'Empanada de Carne Tradicional', type: 'Venta', quantity: 45, unitPrice: 1.80, totalAmount: 81.00, date: '2026-08-22', customerId: 'cli-1', customerName: 'Juan Pérez', notes: 'Venta del mediodía' },
  { id: 'mov-2', productId: 'prod-emp-2', productName: 'Empanada Queso Mozzarella y Maíz', type: 'Venta', quantity: 32, unitPrice: 1.60, totalAmount: 51.20, date: '2026-08-22', customerId: 'cli-3', customerName: 'Carolina Benítez', notes: 'Venta de la tarde' },
  { id: 'mov-3', productId: 'prod-emp-3', productName: 'Combo 6 Empanadas + Bebida', type: 'Venta', quantity: 8, unitPrice: 9.50, totalAmount: 76.00, date: '2026-08-22', customerId: 'cli-1', customerName: 'Juan Pérez', notes: 'Combos familiares' },
  { id: 'mov-4', productId: 'prod-emp-1', productName: 'Empanada de Carne Tradicional', type: 'Merma / Pérdida', quantity: 5, unitPrice: 0.65, totalAmount: 3.25, date: '2026-08-21', notes: 'Producto vencido' },
  { id: 'mov-5', productId: 'rm-1', productName: 'Harina de Trigo Precoz', type: 'Compra Insumos', quantity: 50, unitPrice: 1.20, totalAmount: 60.00, date: '2026-08-20', notes: 'Compra semanal' },
  { id: 'mov-6', productId: 'prod-ropa-1', productName: 'Camiseta Básica Algodón', type: 'Venta', quantity: 15, unitPrice: 25.00, totalAmount: 375.00, date: '2026-08-22', customerId: 'cli-3', customerName: 'Carolina Benítez', notes: 'Venta retail' },
  { id: 'mov-7', productId: 'prod-fer-1', productName: 'Varilla de Acero 1/2" x 6m', type: 'Venta', quantity: 20, unitPrice: 22.00, totalAmount: 440.00, date: '2026-08-20', customerId: 'cli-2', customerName: 'Constructora El Pilar', notes: 'Pedido de obra' }
];
