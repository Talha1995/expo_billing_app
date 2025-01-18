import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

const generateSalesHTML = (reportData) => {
  const { sales, fromDate, toDate, totalAmount } = reportData;

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .store-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .date-range {
            color: #666;
            margin-bottom: 20px;
          }
          .bill-section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
          }
          .bill-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .bill-total {
            text-align: right;
            font-weight: bold;
            margin-top: 10px;
          }
          .grand-total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #333;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">Sales Report</div>
          <div class="date-range">
            From: ${fromDate.toLocaleDateString()} To: ${toDate.toLocaleDateString()}
          </div>
        </div>

        ${sales
          .map(
            (sale) => `
          <div class="bill-section">
            <div class="bill-header">
              <div>Bill #${sale.id}</div>
              <div>${new Date(sale.date).toLocaleDateString()}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${sale.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="bill-total">
              Bill Total: ₹${sale.total.toFixed(2)}
            </div>
          </div>
        `
          )
          .join("")}

        <div class="grand-total">
          Total Sales: ₹${totalAmount.toFixed(2)}
        </div>

        <div class="footer">
          Report generated on ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `;
};

const generateBillHTML = (billData) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: 'Courier New', monospace;
            padding: 10px;
            max-width: 300px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .restaurant-name {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
          }
          .bill-info {
            font-size: 12px;
            margin: 5px 0;
          }
          .items {
            width: 100%;
            margin: 10px 0;
          }
          .item {
            font-size: 12px;
            margin: 5px 0;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
          }
          .quantity {
            width: 30px;
          }
          .item-name {
            flex: 1;
            padding: 0 5px;
          }
          .price {
            width: 60px;
            text-align: right;
          }
          .subtotal {
            border-top: 1px dashed #000;
            margin-top: 10px;
            padding-top: 10px;
          }
          .total {
            font-size: 14px;
            font-weight: bold;
            text-align: right;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            margin: 10px 0;
            padding: 10px 0;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            margin-top: 20px;
          }
          .divider {
            border-bottom: 1px dashed #000;
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="restaurant-name">RESTAURANT NAME</p>
          <p class="bill-info">123 Restaurant Street</p>
          <p class="bill-info">Phone: +1234567890</p>
          <div class="divider"></div>
          <p class="bill-info">Bill #: ${billData.billId}</p>
          <p class="bill-info">Date: ${new Date(
            billData.date
          ).toLocaleString()}</p>
          <p class="bill-info">Customer: ${billData.customerName}</p>
        </div>

        <div class="items">
          <div class="item-row" style="font-weight: bold;">
            <span class="quantity">Qty</span>
            <span class="item-name">Item</span>
            <span class="price">Amount</span>
          </div>
          <div class="divider"></div>

          ${billData.items
            .map(
              (item) => `
            <div class="item">
              <div class="item-row">
                <span class="quantity">${item.quantity}</span>
                <span class="item-name">${item.name}</span>
                <span class="price">₹${(item.price * item.quantity).toFixed(
                  2
                )}</span>
              </div>
              <div class="item-row" style="font-size: 10px; color: #666;">
                <span class="quantity"></span>
                <span class="item-name">@ ₹${item.price.toFixed(2)}</span>
                <span class="price"></span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="subtotal">
          <div class="item-row">
            <span>Subtotal:</span>
            <span>₹${billData.total.toFixed(2)}</span>
          </div>
          <div class="item-row">
            <span>CGST (2.5%):</span>
            <span>₹${(billData.total * 0.025).toFixed(2)}</span>
          </div>
          <div class="item-row">
            <span>SGST (2.5%):</span>
            <span>₹${(billData.total * 0.025).toFixed(2)}</span>
          </div>
        </div>

        <div class="total">
          <div class="item-row">
            <span>TOTAL:</span>
            <span>₹${(billData.total * 1.05).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your visit!</p>
          <p>Please visit again</p>
          <div class="divider"></div>
          <p style="font-size: 10px;">This is a computer generated bill</p>
        </div>
      </body>
    </html>
  `;

  return htmlContent;
};

class PDFService {
  static async generateBillPDF(billData) {
    try {
      const html = generateBillHTML(billData);
      return await this.generateAndSharePDF(html, "Share Bill PDF");
    } catch (error) {
      console.error("Error in generateBillPDF:", error);
      throw error;
    }
  }

  static async generateSalesReport(reportData) {
    try {
      if (!reportData.sales || !Array.isArray(reportData.sales)) {
        throw new Error("Invalid sales data format");
      }

      const html = generateSalesHTML(reportData);
      return await this.generateAndSharePDF(html, "Share Sales Report PDF");
    } catch (error) {
      console.error("Error in generateSalesReport:", error);
      throw error;
    }
  }

  static async generateAndSharePDF(html, dialogTitle) {
    try {
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      if (Platform.OS === "ios") {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle,
        });
      }

      return uri;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }
}

export default PDFService;
