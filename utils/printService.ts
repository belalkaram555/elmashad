// خدمة الطباعة الشاملة
// Print Service - يوفر وظائف طباعة متنوعة لجميع أنواع التقارير والمستندات

import { AppSettings, Order } from '../types';

// أنماط الطباعة المضغوطة (للطباعة في صفحة واحدة)
const compactPrintStyles = `
  @media print {
    @page {
      size: A4;
      margin: 8mm;
    }
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
    direction: rtl;
    text-align: right;
    color: #333;
    background: white;
    font-size: 11px;
    line-height: 1.3;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid #333;
  }
  
  .print-header h1 {
    font-size: 18px;
    margin: 0 0 3px 0;
    color: #000;
  }
  
  .print-header h2 {
    font-size: 12px;
    margin: 0 0 3px 0;
    color: #333;
  }
  
  .print-header p {
    font-size: 9px;
    margin: 1px 0;
    color: #666;
  }
  
  .print-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 5px 8px;
    background: #f5f5f5;
    border-radius: 3px;
    font-size: 10px;
  }
  
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
  }
  
  .print-table th {
    background: #333;
    color: white;
    padding: 5px 4px;
    font-size: 9px;
    text-align: right;
  }
  
  .print-table td {
    padding: 4px;
    border-bottom: 1px solid #eee;
    font-size: 10px;
  }
  
  .print-table tr:nth-child(even) {
    background: #fafafa;
  }
  
  .print-summary {
    background: #f0f0f0;
    padding: 8px;
    border-radius: 4px;
    margin-top: 8px;
  }
  
  .print-summary h3 {
    margin: 0 0 5px 0;
    font-size: 11px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 4px;
  }
  
  .print-summary-row {
    display: flex;
    justify-content: space-between;
    margin: 3px 0;
    font-size: 10px;
  }
  
  .print-summary-total {
    font-size: 13px;
    font-weight: bold;
    border-top: 1px solid #333;
    padding-top: 5px;
    margin-top: 5px;
  }
  
  .print-footer {
    text-align: center;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid #ddd;
    font-size: 8px;
    color: #999;
  }
  
  .signature-area {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
    padding-top: 10px;
  }
  
  .signature-box {
    text-align: center;
    width: 120px;
    font-size: 9px;
  }
  
  .signature-line {
    border-top: 1px solid #333;
    margin-top: 25px;
    padding-top: 3px;
  }
  
  .voucher-box {
    border: 1px solid #333;
    padding: 12px;
    margin: 8px 0;
  }
  
  .voucher-title {
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .voucher-row {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    font-size: 11px;
  }
  
  .voucher-amount {
    text-align: center;
    font-size: 22px;
    font-weight: bold;
    margin: 10px 0;
  }
  
  .voucher-party {
    padding: 8px;
    background: #f5f5f5;
    border-radius: 4px;
    margin: 8px 0;
  }
`;

// أنماط طباعة الإيصال الحراري
const thermalReceiptStyles = `
  @media print {
    @page {
      size: 80mm auto;
      margin: 2mm;
    }
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Courier New', monospace;
    direction: rtl;
    text-align: right;
    color: #000;
    background: white;
    font-size: 11px;
    width: 76mm;
    line-height: 1.2;
  }
  
  .receipt {
    padding: 3mm;
  }
  
  .receipt-header {
    text-align: center;
    border-bottom: 1px dashed #000;
    padding-bottom: 5px;
    margin-bottom: 5px;
  }
  
  .receipt-header h1 {
    font-size: 14px;
    margin: 0 0 2px 0;
  }
  
  .receipt-header p {
    font-size: 9px;
    margin: 1px 0;
  }
  
  .receipt-info {
    border-bottom: 1px dashed #000;
    padding: 5px 0;
    margin-bottom: 5px;
  }
  
  .receipt-info-row {
    display: flex;
    justify-content: space-between;
    font-size: 9px;
    margin: 2px 0;
  }
  
  .receipt-items {
    border-bottom: 1px dashed #000;
    padding-bottom: 5px;
    margin-bottom: 5px;
  }
  
  .receipt-item {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    margin: 3px 0;
  }
  
  .receipt-totals {
    margin: 5px 0;
  }
  
  .receipt-total-row {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    margin: 2px 0;
  }
  
  .receipt-grand-total {
    border-top: 1px dashed #000;
    padding-top: 5px;
    margin-top: 5px;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
  }
  
  .receipt-qr {
    text-align: center;
    margin: 8px 0;
  }
  
  .receipt-footer {
    text-align: center;
    font-size: 9px;
    margin-top: 8px;
    border-top: 1px dashed #000;
    padding-top: 5px;
  }
`;

// أنماط طباعة A4 للفواتير
const a4InvoiceStyles = `
  @media print {
    @page {
      size: A4;
      margin: 15mm;
    }
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
    direction: rtl;
    text-align: right;
    color: #333;
    background: white;
    font-size: 12px;
    line-height: 1.4;
  }
  
  .invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px double #333;
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  
  .invoice-logo {
    text-align: center;
  }
  
  .invoice-logo h1 {
    font-size: 28px;
    margin: 0;
  }
  
  .invoice-logo p {
    font-size: 11px;
    color: #666;
    margin: 2px 0;
  }
  
  .invoice-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    background: #f5f5f5;
    padding: 10px 20px;
    border-radius: 5px;
  }
  
  .invoice-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
    padding: 15px;
    background: #fafafa;
    border-radius: 8px;
  }
  
  .invoice-info-group h4 {
    font-size: 11px;
    color: #666;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
  
  .invoice-info-group p {
    font-size: 13px;
    font-weight: bold;
    margin: 3px 0;
  }
  
  .invoice-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  .invoice-table th {
    background: #333;
    color: white;
    padding: 12px 10px;
    font-size: 11px;
    text-align: right;
  }
  
  .invoice-table td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    font-size: 12px;
  }
  
  .invoice-table tr:nth-child(even) {
    background: #f9f9f9;
  }
  
  .invoice-totals {
    width: 300px;
    margin-right: auto;
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
  }
  
  .invoice-total-row {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;
    font-size: 12px;
  }
  
  .invoice-grand-total {
    border-top: 2px solid #333;
    padding-top: 10px;
    margin-top: 10px;
    font-size: 18px;
    font-weight: bold;
  }
  
  .invoice-footer {
    margin-top: 30px;
    padding-top: 15px;
    border-top: 1px solid #ddd;
  }
  
  .invoice-qr {
    text-align: center;
    margin: 15px 0;
  }
  
  .invoice-thanks {
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    margin-top: 20px;
  }
  
  .invoice-powered {
    text-align: center;
    font-size: 9px;
    color: #999;
    margin-top: 10px;
  }
`;

interface PrintOptions {
  title: string;
  subtitle?: string;
  settings: AppSettings;
  content: string;
  showSignature?: boolean;
  footerNote?: string;
}

// دالة الطباعة الرئيسية (مضغوطة)
export function printDocument(options: PrintOptions) {
  const { title, subtitle, settings, content, showSignature = false, footerNote } = options;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لاستخدام خاصية الطباعة');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
      <style>${compactPrintStyles}</style>
    </head>
    <body>
      <div class="print-container">
        <div class="print-header">
          <h1>${settings.restaurantNameAr}</h1>
          <h2>${settings.branchNameAr}</h2>
          <p>الرقم الضريبي: ${settings.taxId} | هاتف: ${settings.phone}</p>
          <p>${settings.addressAr}</p>
        </div>
        
        <div class="print-info">
          <span><strong>${title}</strong>${subtitle ? ` - ${subtitle}` : ''}</span>
          <span>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')} ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        ${content}
        
        ${showSignature ? `
          <div class="signature-area">
            <div class="signature-box"><div class="signature-line">المدير</div></div>
            <div class="signature-box"><div class="signature-line">المحاسب</div></div>
            <div class="signature-box"><div class="signature-line">المستلم</div></div>
          </div>
        ` : ''}
        
        <div class="print-footer">
          <p>${footerNote || 'M4D CAFE POS System'} © ${new Date().getFullYear()}</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// طباعة سند قبض/صرف (مضغوط)
export function printVoucher(options: {
  type: 'receipt' | 'payment';
  voucherNumber: string;
  date: string;
  partyName: string;
  amount: number;
  description: string;
  currency: string;
  settings: AppSettings;
}) {
  const { type, voucherNumber, date, partyName, amount, description, currency, settings } = options;

  const content = `
    <div class="voucher-box">
      <div class="voucher-title">${type === 'receipt' ? 'سند قبض' : 'سند صرف'}</div>
      
      <div class="voucher-row">
        <span><strong>رقم السند:</strong> ${voucherNumber}</span>
        <span><strong>التاريخ:</strong> ${date}</span>
      </div>
      
      <div class="voucher-party">
        ${type === 'receipt' ? 'استلمنا من:' : 'صرفنا إلى:'}
        <strong style="font-size: 14px; margin-right: 8px;">${partyName}</strong>
      </div>
      
      <div class="voucher-amount" style="color: ${type === 'receipt' ? '#22c55e' : '#ef4444'};">
        ${amount.toLocaleString()} ${currency}
      </div>
      <div style="text-align: center; font-size: 10px; color: #666;">
        (${numberToArabicWords(amount)} ${currency} فقط لا غير)
      </div>
      
      <div style="margin-top: 8px;">
        <strong>البيان:</strong> ${description}
      </div>
    </div>
  `;

  printDocument({
    title: type === 'receipt' ? 'سند قبض' : 'سند صرف',
    subtitle: voucherNumber,
    settings,
    content,
    showSignature: true
  });
}

// طباعة فاتورة شراء (مضغوطة)
export function printPurchaseInvoice(options: {
  invoiceNumber: string;
  date: string;
  supplierName: string;
  items: { name: string; quantity: number; price: number; total: number }[];
  totalAmount: number;
  paymentMethod: string;
  currency: string;
  settings: AppSettings;
  notes?: string;
}) {
  const { invoiceNumber, date, supplierName, items, totalAmount, paymentMethod, currency, settings, notes } = options;

  const content = `
    <div style="display: flex; justify-content: space-between; background: #f5f5f5; padding: 8px; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
      <span><strong>فاتورة:</strong> ${invoiceNumber}</span>
      <span><strong>التاريخ:</strong> ${date}</span>
      <span><strong>المورد:</strong> ${supplierName}</span>
    </div>
    
    <table class="print-table">
      <thead>
        <tr>
          <th>#</th>
          <th>الصنف</th>
          <th>الكمية</th>
          <th>السعر</th>
          <th>الإجمالي</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.price.toLocaleString()}</td>
            <td>${item.total.toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="print-summary">
      <div class="print-summary-row print-summary-total">
        <span>الإجمالي</span>
        <span>${totalAmount.toLocaleString()} ${currency}</span>
      </div>
      <div class="print-summary-row">
        <span>طريقة الدفع</span>
        <span>${paymentMethod === 'cash' ? 'نقداً' : paymentMethod === 'credit' ? 'آجل' : 'تحويل'}</span>
      </div>
      ${notes ? `<div style="font-size: 9px; margin-top: 5px;"><strong>ملاحظات:</strong> ${notes}</div>` : ''}
    </div>
  `;

  printDocument({
    title: 'فاتورة شراء',
    subtitle: invoiceNumber,
    settings,
    content,
    showSignature: true
  });
}

// طباعة جدول بيانات
export function printTable(options: {
  title: string;
  subtitle?: string;
  settings: AppSettings;
  headers: string[];
  rows: (string | number)[][];
  summary?: { label: string; value: string | number }[];
  showSignature?: boolean;
}) {
  const { headers, rows, summary } = options;

  const tableHtml = `
    <table class="print-table">
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    ${summary ? `
      <div class="print-summary">
        ${summary.map(s => `
          <div class="print-summary-row ${s.label.includes('إجمالي') ? 'print-summary-total' : ''}">
            <span>${s.label}</span>
            <span>${s.value}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  printDocument({
    ...options,
    content: tableHtml
  });
}

// ===================== طباعة الفاتورة الضريبية =====================

// طباعة فاتورة ضريبية A4
export function printTaxInvoiceA4(options: {
  order: Order;
  settings: AppSettings;
  currency: string;
  language: string;
  qrValue: string;
}) {
  const { order, settings, currency, language, qrValue } = options;
  const amountReceived = order.amountReceived ?? order.total;
  const remainingAmount = Math.max(0, order.total - amountReceived);
  const paymentMethodLabel = order.paymentMethod === 'cash' ? 'نقداً' : order.paymentMethod === 'instapay' ? 'InstaPay' : 'آجل';

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لاستخدام خاصية الطباعة');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>فاتورة ضريبية #${order.id}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
      <style>${a4InvoiceStyles}</style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="invoice-logo">
          <h1>${settings.restaurantNameAr}</h1>
          <p>${settings.branchNameAr}</p>
          <p>الرقم الضريبي: ${settings.taxId}</p>
          <p>${settings.addressAr}</p>
          <p>هاتف: ${settings.phone}</p>
        </div>
        <div class="invoice-title">فاتورة ضريبية</div>
      </div>
      
      <div class="invoice-info">
        <div class="invoice-info-group">
          <h4>معلومات الفاتورة</h4>
          <p>رقم الفاتورة: #${order.id}</p>
          <p>التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
          <p>الوقت: ${new Date(order.createdAt).toLocaleTimeString('ar-EG')}</p>
        </div>
        <div class="invoice-info-group">
          <h4>معلومات إضافية</h4>
          <p>نوع الخدمة: ${order.type === 'takeaway' ? 'تيك أواي' : 'عميل'}</p>
          <p>طريقة الدفع: ${paymentMethodLabel}</p>
          <p>الموظف: ${order.performedBy?.name || 'غير محدد'}</p>
        </div>
      </div>
      
      <table class="invoice-table">
        <thead>
          <tr>
            <th>#</th>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item: any, i: number) => `
            <tr>
              <td>${i + 1}</td>
              <td>${language === 'ar' ? item.nameAr : item.nameEn}${item.selectedVariant ? ` (${item.selectedVariant.nameAr})` : ''}</td>
              <td>${item.quantity}</td>
              <td>${item.totalItemPrice.toFixed(2)}</td>
              <td>${(item.totalItemPrice * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="invoice-totals">
        <div class="invoice-total-row">
          <span>المجموع الفرعي:</span>
          <span>${order.subtotal.toFixed(2)} ${currency}</span>
        </div>
        ${order.serviceCharge > 0 ? `
          <div class="invoice-total-row">
            <span>رسوم الخدمة:</span>
            <span>${order.serviceCharge.toFixed(2)} ${currency}</span>
          </div>
        ` : ''}
        <div class="invoice-total-row">
          <span>ضريبة القيمة المضافة (${(settings.taxRate * 100)}%):</span>
          <span>${order.tax.toFixed(2)} ${currency}</span>
        </div>
        ${order.discount > 0 ? `
          <div class="invoice-total-row">
            <span>الخصم:</span>
            <span>-${order.discount.toFixed(2)} ${currency}</span>
          </div>
        ` : ''}
        <div class="invoice-total-row invoice-grand-total">
          <span>الإجمالي النهائي:</span>
          <span>${order.total.toFixed(2)} ${currency}</span>
        </div>
        <div class="invoice-total-row">
          <span>المبلغ المستلم:</span>
          <span>${amountReceived.toFixed(2)} ${currency}</span>
        </div>
        <div class="invoice-total-row">
          <span>المبلغ المتبقي:</span>
          <span>${remainingAmount.toFixed(2)} ${currency}</span>
        </div>
        <div class="invoice-total-row">
          <span>طريقة الدفع:</span>
          <span>${paymentMethodLabel}</span>
        </div>
      </div>
      
      <div class="invoice-footer">
        <p style="font-size: 10px; color: #666;">* جميع الأسعار تشمل ضريبة القيمة المضافة</p>
        <div class="invoice-thanks">شكراً لزيارتكم ✨</div>
        <div class="invoice-powered">M4D CAFE POS System © ${new Date().getFullYear()}</div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// طباعة فاتورة حرارية (80mm)
export function printThermalReceipt(options: {
  order: Order;
  settings: AppSettings;
  currency: string;
  language: string;
  qrValue: string;
}) {
  const { order, settings, currency, language, qrValue } = options;
  const amountReceived = order.amountReceived ?? order.total;
  const remainingAmount = Math.max(0, order.total - amountReceived);
  const paymentMethodLabel = order.paymentMethod === 'cash' ? 'نقدي' : order.paymentMethod === 'instapay' ? 'InstaPay' : 'آجل';

  const printWindow = window.open('', '_blank', 'width=320,height=600');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لاستخدام خاصية الطباعة');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>إيصال #${order.id}</title>
      <style>${thermalReceiptStyles}</style>
    </head>
    <body>
      <div class="receipt">
        <div class="receipt-header">
          <h1>${settings.restaurantNameAr}</h1>
          <p>${settings.branchNameAr}</p>
          <p>ض.ر: ${settings.taxId}</p>
          <p>${settings.phone}</p>
        </div>
        
        <div class="receipt-info">
          <div class="receipt-info-row">
            <span>رقم الفاتورة:</span>
            <span style="font-weight: bold; font-size: 12px;">#${order.id}</span>
          </div>
          <div class="receipt-info-row">
            <span>التاريخ:</span>
            <span>${new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
          <div class="receipt-info-row">
            <span>الوقت:</span>
            <span>${new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="receipt-info-row">
            <span>الكاشير:</span>
            <span>${order.performedBy?.name || '-'}</span>
          </div>
        </div>
        
        <div class="receipt-items">
          ${order.items.map((item: any) => `
            <div class="receipt-item">
              <span>${language === 'ar' ? item.nameAr : item.nameEn} x${item.quantity}</span>
              <span>${(item.totalItemPrice * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="receipt-totals">
          <div class="receipt-total-row">
            <span>المجموع:</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          ${order.serviceCharge > 0 ? `
            <div class="receipt-total-row">
              <span>الخدمة:</span>
              <span>${order.serviceCharge.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="receipt-total-row">
            <span>الضريبة:</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div class="receipt-total-row">
            <span>طريقة الدفع:</span>
            <span>${paymentMethodLabel}</span>
          </div>
          <div class="receipt-total-row">
            <span>المستلم:</span>
            <span>${amountReceived.toFixed(2)}</span>
          </div>
          <div class="receipt-total-row">
            <span>المتبقي:</span>
            <span>${remainingAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="receipt-grand-total">
          ${order.total.toFixed(2)} ${currency}
        </div>
        
        <div class="receipt-footer">
          <p>شكراً لزيارتكم</p>
          <p>M4D CAFE POS</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// طباعة تقرير مخزون
export function printInventoryReport(options: {
  items: { name: string; quantity: number; unit: string; value: number }[];
  totalValue: number;
  currency: string;
  settings: AppSettings;
}) {
  const { items, totalValue, currency, settings } = options;

  printTable({
    title: 'تقرير جرد المخزون',
    subtitle: new Date().toLocaleDateString('ar-EG'),
    settings,
    headers: ['#', 'الصنف', 'الكمية', 'الوحدة', 'القيمة'],
    rows: items.map((item, i) => [
      i + 1,
      item.name,
      item.quantity,
      item.unit,
      `${item.value.toLocaleString()} ${currency}`
    ]),
    summary: [
      { label: 'عدد الأصناف', value: items.length },
      { label: 'إجمالي قيمة المخزون', value: `${totalValue.toLocaleString()} ${currency}` }
    ],
    showSignature: true
  });
}

// طباعة تقرير مالي
export function printFinancialReport(options: {
  title: string;
  dateFrom: string;
  dateTo: string;
  income: { label: string; value: number }[];
  expenses: { label: string; value: number }[];
  currency: string;
  settings: AppSettings;
}) {
  const { title, dateFrom, dateTo, income, expenses, currency, settings } = options;

  const totalIncome = income.reduce((sum, i) => sum + i.value, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
  const netProfit = totalIncome - totalExpenses;

  const content = `
    <div style="text-align: center; padding: 6px; background: #f5f5f5; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
      <strong>الفترة: ${dateFrom} - ${dateTo}</strong>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div>
        <h4 style="color: #22c55e; border-bottom: 1px solid #22c55e; padding-bottom: 4px; font-size: 11px;">الإيرادات</h4>
        ${income.map(i => `
          <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 10px; border-bottom: 1px solid #eee;">
            <span>${i.label}</span>
            <span style="color: #22c55e; font-weight: bold;">${i.value.toLocaleString()}</span>
          </div>
        `).join('')}
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 1px solid #22c55e; margin-top: 4px; font-weight: bold; font-size: 11px;">
          <span>الإجمالي</span>
          <span style="color: #22c55e;">${totalIncome.toLocaleString()}</span>
        </div>
      </div>
      
      <div>
        <h4 style="color: #ef4444; border-bottom: 1px solid #ef4444; padding-bottom: 4px; font-size: 11px;">المصروفات</h4>
        ${expenses.map(e => `
          <div style="display: flex; justify-content: space-between; padding: 3px 0; font-size: 10px; border-bottom: 1px solid #eee;">
            <span>${e.label}</span>
            <span style="color: #ef4444; font-weight: bold;">${e.value.toLocaleString()}</span>
          </div>
        `).join('')}
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 1px solid #ef4444; margin-top: 4px; font-weight: bold; font-size: 11px;">
          <span>الإجمالي</span>
          <span style="color: #ef4444;">${totalExpenses.toLocaleString()}</span>
        </div>
      </div>
    </div>
    
    <div class="print-summary" style="margin-top: 12px; text-align: center;">
      <h3 style="margin: 0; font-size: 14px; color: ${netProfit >= 0 ? '#22c55e' : '#ef4444'};">
        صافي ${netProfit >= 0 ? 'الربح' : 'الخسارة'}: ${Math.abs(netProfit).toLocaleString()} ${currency}
      </h3>
    </div>
  `;

  printDocument({
    title,
    settings,
    content,
    showSignature: true
  });
}

// طباعة كشف حساب
export function printAccountStatement(options: {
  accountName: string;
  accountType: 'customer' | 'supplier';
  dateFrom: string;
  dateTo: string;
  openingBalance: number;
  transactions: { date: string; description: string; debit: number; credit: number; balance: number }[];
  closingBalance: number;
  currency: string;
  settings: AppSettings;
}) {
  const { accountName, accountType, dateFrom, dateTo, openingBalance, transactions, closingBalance, currency, settings } = options;

  const content = `
    <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span><strong>${accountType === 'customer' ? 'العميل' : 'المورد'}:</strong> ${accountName}</span>
        <span><strong>الفترة:</strong> ${dateFrom} - ${dateTo}</span>
      </div>
      <div><strong>الرصيد الافتتاحي:</strong> ${openingBalance.toLocaleString()} ${currency}</div>
    </div>
    
    <table class="print-table">
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>البيان</th>
          <th>مدين</th>
          <th>دائن</th>
          <th>الرصيد</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(t => `
          <tr>
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td style="color: #ef4444;">${t.debit > 0 ? t.debit.toLocaleString() : '-'}</td>
            <td style="color: #22c55e;">${t.credit > 0 ? t.credit.toLocaleString() : '-'}</td>
            <td style="font-weight: bold;">${t.balance.toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="print-summary">
      <div class="print-summary-row print-summary-total">
        <span>الرصيد الختامي</span>
        <span style="color: ${closingBalance >= 0 ? '#22c55e' : '#ef4444'};">${closingBalance.toLocaleString()} ${currency}</span>
      </div>
    </div>
  `;

  printDocument({
    title: `كشف حساب ${accountType === 'customer' ? 'عميل' : 'مورد'}`,
    subtitle: accountName,
    settings,
    content,
    showSignature: true
  });
}

// تحويل الأرقام إلى كلمات عربية
function numberToArabicWords(num: number): string {
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', 'عشر', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  if (num === 0) return 'صفر';
  if (num < 10) return ones[num];
  if (num < 100) return ones[num % 10] + (num % 10 ? ' و' : '') + tens[Math.floor(num / 10)];
  if (num < 1000) return hundreds[Math.floor(num / 100)] + (num % 100 ? ' و' + numberToArabicWords(num % 100) : '');
  if (num < 10000) return ones[Math.floor(num / 1000)] + ' آلاف' + (num % 1000 ? ' و' + numberToArabicWords(num % 1000) : '');

  return num.toLocaleString('ar-EG');
}
