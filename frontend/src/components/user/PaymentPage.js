import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Import the useAuth hook
import axios from 'axios';

const PaymentPage = () => {
    const { user } = useAuth(); // Access user data from context
    const [customerName, setCustomerName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');

    // Dynamically load Razorpay script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = (e) => {
        e.preventDefault();
        
        const paymentAmount = Number(amount); // Convert amount to number
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        const options = {
            key: "rzp_test_sQPGWHFPH9D53t", // Replace with your Razorpay key
            amount: paymentAmount * 100, // Amount in paise
            currency: "INR",
            name: "Movie Payment",
            description: "Payment for movie ticket",
            handler: function (response) {
                alert(`Payment successful: ${response.razorpay_payment_id}`);
            },
            prefill: {
                name: customerName,
                email: email,
                contact: phone,
            },
            notes: {
                address: address,
            },
            theme: {
                color: "#F37254",
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    // Ensure the user is logged in and is a customer
    if (!user || user.role !== "customer") {
        return <h2 className="text-center text-red-500 mt-10">Access Denied</h2>;
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-4">Payment Form</h2>
            <form onSubmit={handlePayment} className="bg-white p-6 rounded shadow-md mt-6">
                <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="border p-2 w-full mb-4" />
                <input type="email" placeholder="Email ID" value={email} onChange={(e) => setEmail(e.target.value)} required className="border p-2 w-full mb-4" />
                <input type="number" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="border p-2 w-full mb-4" />
                <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required className="border p-2 w-full mb-4" />
                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" required className="border p-2 w-full mb-4" />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200 w-full">
                    Pay Now
                </button>
            </form>
        </div>
    );
};

export default PaymentPage;
