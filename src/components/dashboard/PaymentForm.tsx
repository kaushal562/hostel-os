import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  feeAmount?: number;
  dueDate?: string;
  onPaymentComplete?: (details: PaymentDetails) => void;
}

interface PaymentDetails {
  amount: number;
  method: string;
  cardNumber?: string;
  cardName?: string;
  expiryDate?: string;
  cvv?: string;
  transactionId: string;
}

const PaymentForm = ({
  isOpen = true,
  onClose = () => {},
  feeAmount = 5000,
  dueDate = "2023-12-31",
  onPaymentComplete = () => {},
}: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [amount, setAmount] = useState(feeAmount.toString());
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "error" | null
  >(null);
  const [transactionId, setTransactionId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Generate a transaction ID
      const randomTransactionId =
        "TXN" + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Insert payment record into Supabase
      const { data, error } = await supabase.from("payments").insert([
        {
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          transaction_id: randomTransactionId,
          status: "completed",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      console.log("Payment recorded successfully:", data);

      // Update UI
      setIsProcessing(false);
      setPaymentStatus("success");
      setTransactionId(randomTransactionId);

      // Move to receipt step
      setStep(3);

      // Call the callback with payment details
      onPaymentComplete({
        amount: parseFloat(amount),
        method: paymentMethod,
        cardNumber: paymentMethod === "credit_card" ? cardNumber : undefined,
        cardName: paymentMethod === "credit_card" ? cardName : undefined,
        expiryDate: paymentMethod === "credit_card" ? expiryDate : undefined,
        cvv: paymentMethod === "credit_card" ? cvv : undefined,
        transactionId: randomTransactionId,
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      setIsProcessing(false);
      setPaymentStatus("error");
      // In a real app, you would show an error message to the user
    }
  };

  const resetForm = () => {
    setPaymentMethod("credit_card");
    setAmount(feeAmount.toString());
    setCardNumber("");
    setCardName("");
    setExpiryDate("");
    setCvv("");
    setUpiId("");
    setBankAccount("");
    setIfscCode("");
    setStep(1);
    setPaymentStatus(null);
    setTransactionId("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderPaymentMethodFields = () => {
    switch (paymentMethod) {
      case "credit_card":
        return (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium mb-1"
              >
                Card Number
              </label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
              />
            </div>
            <div>
              <label
                htmlFor="cardName"
                className="block text-sm font-medium mb-1"
              >
                Name on Card
              </label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium mb-1"
                >
                  Expiry Date
                </label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                  CVV
                </label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        );
      case "upi":
        return (
          <div>
            <label htmlFor="upiId" className="block text-sm font-medium mb-1">
              UPI ID
            </label>
            <Input
              id="upiId"
              placeholder="username@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        );
      case "bank_transfer":
        return (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="bankAccount"
                className="block text-sm font-medium mb-1"
              >
                Account Number
              </label>
              <Input
                id="bankAccount"
                placeholder="Enter account number"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="ifscCode"
                className="block text-sm font-medium mb-1"
              >
                IFSC Code
              </label>
              <Input
                id="ifscCode"
                placeholder="ABCD0123456"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: // Payment Method Selection
        return (
          <>
            <DialogHeader>
              <DialogTitle>Fee Payment</DialogTitle>
              <DialogDescription>
                Select your preferred payment method to pay your hostel fees.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <Card
                className={`cursor-pointer hover:border-primary transition-colors ${paymentMethod === "credit_card" ? "border-primary bg-primary/5" : ""}`}
                onClick={() => setPaymentMethod("credit_card")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Credit/Debit Card
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Pay securely with your card
                  </p>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer hover:border-primary transition-colors ${paymentMethod === "upi" ? "border-primary bg-primary/5" : ""}`}
                onClick={() => setPaymentMethod("upi")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">UPI</CardTitle>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 12L16 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 8L12 16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Pay instantly with UPI
                  </p>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer hover:border-primary transition-colors ${paymentMethod === "bank_transfer" ? "border-primary bg-primary/5" : ""}`}
                onClick={() => setPaymentMethod("bank_transfer")}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bank Transfer
                  </CardTitle>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 21H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 10H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 6L12 3L19 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 10V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 10V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 14V17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 14V17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 14V17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Pay via bank transfer
                  </p>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep(2)}>Continue</Button>
            </DialogFooter>
          </>
        );
      case 2: // Payment Details
        return (
          <>
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Enter your payment information to complete the transaction.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium mb-1"
                >
                  Amount (₹)
                </label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium mb-1"
                >
                  Payment Method
                </label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">
                      Credit/Debit Card
                    </SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderPaymentMethodFields()}
              <div className="text-sm text-muted-foreground mt-4">
                <p>Due date: {dueDate}</p>
                <p className="mt-1">
                  A receipt will be sent to your registered email address.
                </p>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Pay Now"}
                </Button>
              </DialogFooter>
            </form>
          </>
        );
      case 3: // Receipt
        return (
          <>
            <DialogHeader>
              <DialogTitle>
                {paymentStatus === "success"
                  ? "Payment Successful"
                  : "Payment Failed"}
              </DialogTitle>
              <DialogDescription>
                {paymentStatus === "success"
                  ? "Your payment has been processed successfully."
                  : "There was an issue processing your payment."}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center justify-center">
              {paymentStatus === "success" ? (
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Thank You!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your payment of ₹{amount} has been received.
                  </p>
                  <div className="bg-muted p-4 rounded-md text-sm mb-4">
                    <p className="flex justify-between py-1">
                      <span>Transaction ID:</span>{" "}
                      <span className="font-medium">{transactionId}</span>
                    </p>
                    <p className="flex justify-between py-1">
                      <span>Date:</span>{" "}
                      <span className="font-medium">
                        {new Date().toLocaleDateString()}
                      </span>
                    </p>
                    <p className="flex justify-between py-1">
                      <span>Payment Method:</span>{" "}
                      <span className="font-medium">
                        {paymentMethod === "credit_card"
                          ? "Credit/Debit Card"
                          : paymentMethod === "upi"
                            ? "UPI"
                            : "Bank Transfer"}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Payment Failed</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please try again or use a different payment method.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              {paymentStatus === "success" ? (
                <Button onClick={handleClose}>Close</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={() => setStep(1)}>Try Again</Button>
                </>
              )}
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
