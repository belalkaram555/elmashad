
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { generateZatcaBase64 } from '../utils/zatca';
import { Order, AppSettings } from '../types';

interface ReceiptTemplateProps {
  order: Order;
  settings: AppSettings;
  currency: string;
  language: string;
  t: (key: any) => string;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ order, settings, currency, language, t }) => {
    const paymentLabels: Record<string, string> = {
        cash: 'نقدي',
        instapay: 'InstaPay',
        credit: 'آجل'
    };
    const amountReceived = order.amountReceived ?? order.total;
    const remainingAmount = Math.max(0, order.total - amountReceived);
    const changeAmount = order.changeAmount ?? Math.max(0, amountReceived - order.total);

    const qrValue = generateZatcaBase64(
        settings.restaurantNameAr,
        settings.taxId,
        order.createdAt,
        order.total.toString(),
        order.tax.toString()
    );

    return (
        <div className="receipt-template font-sans !text-black bg-white text-right p-4 w-full max-w-[400px] mx-auto border border-gray-100" dir="rtl">
            {/* Header */}
            <div className="text-center space-y-1 mb-6 border-b-2 border-dashed border-black pb-4">
                <h1 className="text-3xl font-black !text-black mb-1">{settings.restaurantNameAr}</h1>
                <p className="text-sm font-black !text-gray-700 bg-gray-100 py-1 rounded-md">{settings.branchNameAr}</p>
                
                <div className="flex flex-col text-[11px] !text-black font-bold pt-2 space-y-0.5">
                    {settings.taxId && <span className="flex justify-center gap-1"><span>الرقم الضريبي:</span> <span className="font-black">{settings.taxId}</span></span>}
                    {settings.addressAr && <span className="flex justify-center gap-1"><span>الموقع:</span> <span className="font-black">{settings.addressAr}</span></span>}
                    {settings.phone && <span className="flex justify-center gap-1"><span>للتواصل:</span> <span className="font-black">{settings.phone}</span></span>}
                </div>
            </div>

            {/* Order Info */}
            <div className="space-y-1.5 text-xs mb-4 border-b border-gray-200 pb-3">
                <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-black !text-black">رقم الفاتورة:</span>
                    <span className="text-4xl font-black !text-black tracking-tighter">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                    <span className="!text-gray-600">الموظف المسؤول:</span>
                    <span className="font-bold !text-black">{order.performedBy?.name || 'مدير النظام'}</span>
                </div>
                <div className="flex justify-between"><span className="!text-gray-600">تاريخ العملية:</span><span className="!text-black font-bold">{new Date(order.createdAt).toLocaleDateString('ar-EG')} {new Date(order.createdAt).toLocaleTimeString('ar-EG')}</span></div>
                <div className="flex justify-between"><span className="!text-gray-600">نوع الخدمة:</span><span className="font-bold !text-black">{t(order.type)}</span></div>
                <div className="flex justify-between"><span className="!text-gray-600">طريقة السداد:</span><span className="font-bold !text-black">{paymentLabels[order.paymentMethod] || t(order.paymentMethod as any)}</span></div>
                {order.customerName && <div className="flex justify-between"><span className="!text-gray-600">العميل:</span><span className="font-bold !text-black">{order.customerName}</span></div>}
            </div>

            {/* Items Table */}
            <table className="w-full text-xs mb-4">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-2 text-right !text-black font-black">الصنف (شامل)</th>
                        <th className="py-2 text-center !text-black font-black">ك</th>
                        <th className="py-2 text-left !text-black font-black">الإجمالي</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {order.items.map((item: any, idx: number) => (
                        <tr key={idx} className="align-top">
                            <td className="py-2">
                                <div className="font-black !text-black">{language === 'ar' ? item.nameAr : item.nameEn}</div>
                                {item.selectedVariant && <div className="text-[9px] !text-gray-500 font-bold">({item.selectedVariant.nameAr})</div>}
                            </td>
                            <td className="py-2 text-center !text-black font-bold">{item.quantity}</td>
                            <td className="py-2 text-left font-black !text-black">{(item.totalItemPrice * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals - Modified for Inclusive Tax */}
            <div className="space-y-1.5 text-sm mb-6 border-t-2 border-dashed border-black pt-4">
                <div className="flex justify-between font-bold"><span className="!text-gray-600 text-xs">المجموع قبل الضريبة:</span><span className="!text-black">{order.subtotal.toFixed(2)}</span></div>
                {order.serviceCharge > 0 && <div className="flex justify-between"><span className="!text-gray-600 text-xs">رسوم الخدمة (12%):</span><span className="!text-black">{order.serviceCharge.toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold"><span className="!text-gray-600 text-xs">ضريبة القيمة المضافة (شاملة):</span><span className="!text-black">{order.tax.toFixed(2)}</span></div>
                
                <div className="flex justify-between text-2xl font-black pt-3 border-t-2 border-black mt-2">
                    <span className="!text-black">إجمالي الفاتورة:</span>
                    <span className="!text-black">{order.total.toFixed(2)} <span className="text-xs">{currency}</span></span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="border border-gray-300 rounded-md p-2">
                        <p className="text-[10px] !text-gray-600 font-bold">المبلغ المستلم</p>
                        <p className="text-base font-black !text-black">{amountReceived.toFixed(2)} {currency}</p>
                    </div>
                    <div className="border border-gray-300 rounded-md p-2">
                        <p className="text-[10px] !text-gray-600 font-bold">المبلغ المتبقي</p>
                        <p className="text-base font-black !text-black">{remainingAmount.toFixed(2)} {currency}</p>
                    </div>
                </div>
                {changeAmount > 0 && <div className="flex justify-between font-bold"><span className="!text-gray-600 text-xs">الباقي للعميل:</span><span className="!text-black">{changeAmount.toFixed(2)} {currency}</span></div>}
                <p className="text-[10px] text-center !text-gray-500 font-bold">* جميع الأسعار تشمل ضريبة القيمة المضافة {(settings.taxRate * 100)}%</p>
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center mb-6">
                <QRCodeCanvas value={qrValue} size={110} level="M" includeMargin={false} />
            </div>
            
            {/* Footer */}
            <div className="text-center mt-6 space-y-1 border-t border-gray-100 pt-4 italic">
                <p className="text-[12px] font-black !text-black">{t('thankYou')}</p>
                <p className="text-[8px] !text-gray-400 font-bold uppercase tracking-widest">Powered by M4D CAFE Systems</p>
            </div>
        </div>
    );
};
