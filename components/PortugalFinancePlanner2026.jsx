'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, PiggyBank, CreditCard, Home, Users, Trash2, Plus } from 'lucide-react';

const PortugalFinancePlanner2026 = () => {
  const [step, setStep] = useState(1);
  const [finances, setFinances] = useState({
    // Income
    monthlySalaryNet: 0,
    receivesSubsidios: 'yes',
    subsidioFerias: 0,
    subsidioNatal: 0,
    otherMonthlyIncome: 0,
    otherYearlyIncome: 0,
    
    // Fixed Expenses
    rent: 0,
    utilities: 0,
    insurance: 0,
    phoneInternet: 0,
    transportPass: 0,
    condominium: 0,
    
    // Variable Expenses
    groceries: 0,
    dining: 0,
    entertainment: 0,
    subscriptions: 0,
    clothing: 0,
    health: 0,
    education: 0,
    pets: 0,
    other: 0,
    
    // Loans - now as an array
    loans: [],
    
    // Credit Card
    creditCardDebt: 0,
    creditCardMonthlyPayment: 0,
    creditCardInterestRate: 18,
    
    // Savings & Goals
    currentSavings: 0,
    emergencyFundGoal: 0,
    savingsGoal2026: 0,
    
    // Investments
    hasInvestments: 'no',
    investments: {
      certificadosAforro: 0,
      ppr: 0,
      etfs: 0,
      acoes: 0,
      fundos: 0,
      crypto: 0,
      outros: 0
    },
    
    // Family
    dependents: 0,
    household: 1
  });

  const [plan, setPlan] = useState(null);

  const updateFinance = (field, value) => {
    setFinances({ ...finances, [field]: value });
  };

  const addLoan = () => {
    setFinances({
      ...finances,
      loans: [...finances.loans, {
        id: Date.now(),
        name: '',
        totalAmount: 0,
        monthlyPayment: 0,
        interestRate: 0,
        remainingMonths: 0
      }]
    });
  };

  const updateLoan = (id, field, value) => {
    setFinances({
      ...finances,
      loans: finances.loans.map(loan =>
        loan.id === id ? { ...loan, [field]: value } : loan
      )
    });
  };

  const removeLoan = (id) => {
    setFinances({
      ...finances,
      loans: finances.loans.filter(loan => loan.id !== id)
    });
  };

  const calculatePlan = () => {
    // Calculate annual income - EXCLUDING subsídios from monthly calculations
    // Subsídios are bonus money for savings/debt/investments, not for regular expenses
    const monthlyBaseSalary = finances.monthlySalaryNet;
    const yearlyBaseSalary = monthlyBaseSalary * 12;
    
    // Subsídios are tracked separately as "bonus" money
    let subsidiosTotal = 0;
    if (finances.receivesSubsidios === 'yes') {
      const subsidioFerias = finances.subsidioFerias || finances.monthlySalaryNet;
      const subsidioNatal = finances.subsidioNatal || finances.monthlySalaryNet;
      subsidiosTotal = subsidioFerias + subsidioNatal;
    }
    
    const yearlyOtherIncome = (finances.otherMonthlyIncome * 12) + finances.otherYearlyIncome;
    
    // For monthly budgeting: base salary + other monthly income (NO subsídios)
    const averageMonthlyIncome = monthlyBaseSalary + finances.otherMonthlyIncome;
    
    // For yearly totals: include everything
    const totalYearlyIncome = yearlyBaseSalary + yearlyOtherIncome + subsidiosTotal;
    
    // Calculate expenses
    const monthlyFixedExpenses = finances.rent + finances.utilities + finances.insurance + 
                                  finances.phoneInternet + finances.transportPass + finances.condominium;
    
    const monthlyVariableExpenses = finances.groceries + finances.dining + finances.entertainment + 
                                     finances.subscriptions + finances.clothing + finances.health + finances.education + 
                                     finances.pets + finances.other;
    
    // Calculate total loan payments and interest
    const monthlyLoanPayments = finances.loans.reduce((sum, loan) => sum + parseFloat(loan.monthlyPayment || 0), 0);
    const totalLoanDebt = finances.loans.reduce((sum, loan) => sum + parseFloat(loan.totalAmount || 0), 0);
    const weightedInterestRate = finances.loans.length > 0 
      ? finances.loans.reduce((sum, loan) => {
          const amount = parseFloat(loan.totalAmount || 0);
          const rate = parseFloat(loan.interestRate || 0);
          return sum + (amount * rate);
        }, 0) / totalLoanDebt
      : 0;
    
    const monthlyDebtPayments = monthlyLoanPayments + finances.creditCardMonthlyPayment;
    
    const totalMonthlyExpenses = monthlyFixedExpenses + monthlyVariableExpenses + monthlyDebtPayments;
    const monthlyDisposable = averageMonthlyIncome - totalMonthlyExpenses;
    const yearlyDisposable = monthlyDisposable * 12;
    
    // Calculate recommended emergency fund (6 months of expenses, range is 3-6)
    const recommendedEmergencyFund = totalMonthlyExpenses * 6;
    const minimumEmergencyFund = totalMonthlyExpenses * 3;
    const emergencyFundGap = Math.max(0, recommendedEmergencyFund - finances.currentSavings);
    
    // Analysis
    const savingsRate = averageMonthlyIncome > 0 ? (monthlyDisposable / averageMonthlyIncome) * 100 : 0;
    const expenseRatio = averageMonthlyIncome > 0 ? (totalMonthlyExpenses / averageMonthlyIncome) * 100 : 0;
    
    // Debt analysis
    const totalDebt = totalLoanDebt + finances.creditCardDebt;
    const monthlyInterestPaid = finances.loans.reduce((sum, loan) => {
      const amount = parseFloat(loan.totalAmount || 0);
      const rate = parseFloat(loan.interestRate || 0) / 100 / 12;
      return sum + (amount * rate);
    }, 0) + (finances.creditCardDebt * (finances.creditCardInterestRate / 100 / 12));
    
    const yearlyInterestPaid = monthlyInterestPaid * 12;
    
    // ===== NEW PRIORITY-BASED RECOMMENDATION SYSTEM =====
    const recommendations = [];
    
    // Calculate debt avalanche order (highest interest first, excluding mortgage)
    const nonMortgageLoans = finances.loans.filter(loan => 
      !loan.name.toLowerCase().includes('habitação') && 
      !loan.name.toLowerCase().includes('casa') &&
      !loan.name.toLowerCase().includes('mortgage')
    );
    
    const allDebts = [
      ...nonMortgageLoans.map(loan => ({
        name: loan.name,
        amount: parseFloat(loan.totalAmount || 0),
        payment: parseFloat(loan.monthlyPayment || 0),
        rate: parseFloat(loan.interestRate || 0),
        months: parseInt(loan.remainingMonths || 0)
      })),
      ...(finances.creditCardDebt > 0 ? [{
        name: 'Cartão de Crédito',
        amount: finances.creditCardDebt,
        payment: finances.creditCardMonthlyPayment,
        rate: finances.creditCardInterestRate,
        months: finances.creditCardMonthlyPayment > 0 ? Math.ceil(finances.creditCardDebt / finances.creditCardMonthlyPayment) : 999
      }] : [])
    ].sort((a, b) => b.rate - a.rate); // Sort by interest rate descending
    
    const totalNonMortgageDebt = allDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalDebtPayment = allDebts.reduce((sum, d) => sum + d.payment, 0);
    
    // Calculate total investments
    const totalInvestments = finances.hasInvestments === 'yes' 
      ? Object.values(finances.investments).reduce((sum, val) => sum + parseFloat(val || 0), 0)
      : 0;
    
    const totalNetWorth = finances.currentSavings + totalInvestments - totalDebt;
    
    // PRIORITY 1: Emergency Starter Fund (€1000)
    if (finances.currentSavings < 1000) {
      const needed = 1000 - finances.currentSavings;
      const monthsToSave = monthlyDisposable > 0 ? Math.ceil(needed / monthlyDisposable) : 999;
      
      recommendations.push({
        priority: 'Crítica',
        step: 'PASSO 1',
        category: '🎯 Fundo de Emergência Inicial',
        action: `Primeiro objetivo: guardar €1000 para emergências. Faltam €${needed.toFixed(0)}.`,
        impact: `Com €${Math.max(monthlyDisposable, 0).toFixed(0)}/mês disponível, podem atingir isto em ${monthsToSave} ${monthsToSave === 1 ? 'mês' : 'meses'}`,
        timeline: `Meta: ${monthsToSave <= 2 ? 'Imediato' : monthsToSave <= 4 ? 'Até ${new Date(new Date().setMonth(new Date().getMonth() + monthsToSave)).toLocaleDateString("pt-PT", {month: "long"})}' : `${monthsToSave} meses`}`,
        actionSteps: [
          'Abrir conta poupança separada HOJE',
          'Transferir todo o dinheiro disponível imediatamente',
          'Cortar despesas não essenciais temporariamente',
          'Considerar vender items que não usam',
          'Este é apenas um colchão inicial - vão aumentar depois'
        ]
      });
    }
    
    // PRIORITY 2: Pay Off All Debt (Except Mortgage) - Debt Avalanche Method
    else if (totalNonMortgageDebt > 0 && finances.currentSavings >= 1000) {
      const highestInterestDebt = allDebts[0];
      
      // Calculate impact of paying extra
      const extraPayment = Math.max(monthlyDisposable * 0.5, 100); // Suggest paying 50% of disposable or min €100
      const newMonthlyPayment = highestInterestDebt.payment + extraPayment;
      
      // Original timeline
      const originalMonths = highestInterestDebt.months;
      const originalInterest = highestInterestDebt.amount * (highestInterestDebt.rate / 100 / 12) * originalMonths;
      
      // With extra payments
      const monthlyRate = highestInterestDebt.rate / 100 / 12;
      let remainingBalance = highestInterestDebt.amount;
      let newMonths = 0;
      let totalInterestPaid = 0;
      
      while (remainingBalance > 0 && newMonths < 600) {
        const interestCharge = remainingBalance * monthlyRate;
        totalInterestPaid += interestCharge;
        const principalPayment = Math.min(newMonthlyPayment - interestCharge, remainingBalance);
        remainingBalance -= principalPayment;
        newMonths++;
      }
      
      const monthsSaved = originalMonths - newMonths;
      const interestSaved = originalInterest - totalInterestPaid;
      
      // Calculate when ALL debts would be paid off
      let totalMonthsToDebtFree = newMonths;
      let currentPaymentAvailable = newMonthlyPayment;
      
      for (let i = 1; i < allDebts.length; i++) {
        const debt = allDebts[i];
        const paymentForThisDebt = currentPaymentAvailable + debt.payment;
        const monthsForThisDebt = Math.ceil(debt.amount / paymentForThisDebt);
        totalMonthsToDebtFree += monthsForThisDebt;
        currentPaymentAvailable = paymentForThisDebt;
      }
      
      const debtFreeDate = new Date();
      debtFreeDate.setMonth(debtFreeDate.getMonth() + totalMonthsToDebtFree);
      
      recommendations.push({
        priority: 'Crítica',
        step: 'PASSO 2',
        category: '💳 Eliminar Todas as Dívidas',
        action: `Têm ${allDebts.length} dívida${allDebts.length > 1 ? 's' : ''} totalizando €${totalNonMortgageDebt.toFixed(0)} (excluindo crédito habitação).\n\n📊 Vossas dívidas:\n${allDebts.map((d, i) => `${i + 1}. ${d.name}: €${d.amount.toFixed(0)} a ${d.rate}%${i === 0 ? ' ⚠️ ATACAR PRIMEIRO' : ''}`).join('\n')}\n\nMétodo Avalanche: Pagar primeiro a dívida com MAIOR taxa de juro ("${highestInterestDebt.name}" a ${highestInterestDebt.rate}%).`,
        impact: `Pagando €${extraPayment.toFixed(0)} extra/mês na dívida com juros mais altos:\n• Poupa ${monthsSaved} meses de pagamentos\n• Poupa €${interestSaved.toFixed(0)} em juros\n• Ficam livres de TODAS as dívidas em ${debtFreeDate.toLocaleDateString('pt-PT', {month: 'long', year: 'numeric'})}\n• Libertam €${totalDebtPayment.toFixed(0)}/mês quando terminarem!`,
        timeline: `Meta: Livres de dívida até ${debtFreeDate.toLocaleDateString('pt-PT', {month: 'long', year: 'numeric'})}`,
        actionSteps: [
          `1️⃣ Pagar mínimo em TODAS: €${(totalDebtPayment - highestInterestDebt.payment).toFixed(0)}/mês nas outras`,
          `2️⃣ Atacar "${highestInterestDebt.name}": €${newMonthlyPayment.toFixed(0)}/mês (mínimo €${highestInterestDebt.payment.toFixed(0)} + €${extraPayment.toFixed(0)} extra)`,
          allDebts.length > 1 ? `3️⃣ Quando "${highestInterestDebt.name}" acabar, atacar "${allDebts[1].name}" (próxima com juros mais altos)` : '',
          '4️⃣ Efeito bola de neve: cada dívida paga liberta mais dinheiro para a próxima',
          '5️⃣ Usar subsídios INTEIROS para eliminar dívidas mais rápido',
          '⛔ NÃO fazer novas dívidas enquanto pagam as existentes'
        ].filter(Boolean)
      });
      
      // Add debt avalanche order visualization
      if (allDebts.length > 1) {
        recommendations.push({
          priority: 'Alta',
          step: 'PASSO 2 (continuação)',
          category: '📊 Ordem de Ataque às Dívidas',
          action: 'Método Avalanche - Pagar pela ordem de taxa de juro (maior para menor):',
          impact: 'Esta ordem poupa o máximo de dinheiro em juros',
          timeline: 'Seguir esta ordem rigorosamente',
          actionSteps: allDebts.map((debt, idx) => 
            `${idx + 1}. ${debt.name}: €${debt.amount.toFixed(0)} a ${debt.rate}% (${debt.months} meses)`
          )
        });
      }
    }
    
    // PRIORITY 3: Full Emergency Fund (3-6 months expenses)
    else if (finances.currentSavings < recommendedEmergencyFund && totalNonMortgageDebt === 0) {
      const needed = recommendedEmergencyFund - finances.currentSavings;
      const monthsToSave = monthlyDisposable > 0 ? Math.ceil(needed / monthlyDisposable) : 999;
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + monthsToSave);
      
      const hasInvestmentsNote = totalInvestments > 0 
        ? `\n\nNota: Já têm €${totalInvestments.toFixed(0)} investidos. Excelente! Mas o fundo de emergência deve estar em dinheiro líquido, não investido.`
        : '';
      
      recommendations.push({
        priority: 'Muito Alta',
        step: 'PASSO 3',
        category: '🏦 Fundo de Emergência Completo',
        action: `Agora sem dívidas, construir fundo completo de €${recommendedEmergencyFund.toFixed(0)} (6 meses de despesas). Faltam €${needed.toFixed(0)}.${hasInvestmentsNote}\n\nℹ️ Recomendação: 3-6 meses. Usamos 6 meses para maior segurança.`,
        impact: `Poupando €${monthlyDisposable.toFixed(0)}/mês:\n• Atingem o objetivo em ${targetDate.toLocaleDateString('pt-PT', {month: 'long', year: 'numeric'})}\n• Estarão protegidos contra desemprego, doença, ou avarias\n• Sem este fundo, qualquer emergência cria nova dívida`,
        timeline: `Meta: ${targetDate.toLocaleDateString('pt-PT', {month: 'long', year: 'numeric'})}`,
        actionSteps: [
          'Continuar a poupar intensamente (ainda não investir MAIS)',
          totalInvestments > 0 ? 'Manter investimentos atuais - não vender!' : 'Guardar em conta poupança, não investir',
          'Usar subsídios para acelerar este objetivo',
          'Manter em conta poupança líquida (Bankinter, ActivoBank)',
          'Não investir este dinheiro - tem que estar sempre disponível',
          'Quando atingir: podem RESPIRAR e investir mais agressivamente!'
        ]
      });
    }
    
    // PRIORITY 4: Invest 15% of Income
    else if (savingsRate < 15 && finances.currentSavings >= recommendedEmergencyFund && totalNonMortgageDebt === 0) {
      const target15Percent = averageMonthlyIncome * 0.15;
      const currentSavings = monthlyDisposable;
      const gap = target15Percent - currentSavings;
      const yearlyInvestment = target15Percent * 12;
      
      // Calculate 30-year projection at 7% average return
      const years = 30;
      const annualReturn = 0.07;
      const futureValue = yearlyInvestment * (((Math.pow(1 + annualReturn, years) - 1) / annualReturn));
      
      // Include existing investments in projection
      const existingInvestmentsFuture = totalInvestments * Math.pow(1 + annualReturn, years);
      const totalFutureValue = futureValue + existingInvestmentsFuture;
      
      const investmentBreakdown = totalInvestments > 0 
        ? `\n\nInvestimentos atuais: €${totalInvestments.toFixed(0)}\n${finances.investments.certificadosAforro > 0 ? `• Certificados: €${finances.investments.certificadosAforro.toFixed(0)}\n` : ''}${finances.investments.ppr > 0 ? `• PPR: €${finances.investments.ppr.toFixed(0)}\n` : ''}${finances.investments.etfs > 0 ? `• ETFs: €${finances.investments.etfs.toFixed(0)}\n` : ''}${finances.investments.acoes > 0 ? `• Ações: €${finances.investments.acoes.toFixed(0)}\n` : ''}${finances.investments.fundos > 0 ? `• Fundos: €${finances.investments.fundos.toFixed(0)}\n` : ''}${finances.investments.crypto > 0 ? `• Crypto: €${finances.investments.crypto.toFixed(0)}\n` : ''}${finances.investments.outros > 0 ? `• Outros: €${finances.investments.outros.toFixed(0)}\n` : ''}`
        : '';
      
      recommendations.push({
        priority: 'Alta',
        step: 'PASSO 4',
        category: '📈 Investir 15% do Rendimento',
        action: `Objetivo: investir 15% do rendimento (€${target15Percent.toFixed(0)}/mês). Atualmente poupam: ${savingsRate.toFixed(1)}% (€${currentSavings.toFixed(0)}/mês).${investmentBreakdown}`,
        impact: totalInvestments > 0 
          ? `Investindo €${target15Percent.toFixed(0)}/mês durante 30 anos a 7% retorno médio:\n• Novos investimentos: €${futureValue.toFixed(0)}\n• Investimentos atuais crescem para: €${existingInvestmentsFuture.toFixed(0)}\n• TOTAL em 30 anos: €${totalFutureValue.toFixed(0)}\n• Já têm uma base excelente - continuem!`
          : `Investindo €${target15Percent.toFixed(0)}/mês durante 30 anos a 7% retorno médio:\n• Total investido: €${(yearlyInvestment * 30).toFixed(0)}\n• Valor final estimado: €${futureValue.toFixed(0)}\n• Crescimento: €${(futureValue - yearlyInvestment * 30).toFixed(0)} (juros compostos!)`,
        timeline: 'Meta: Começar JÁ e manter durante décadas',
        actionSteps: [
          gap > 0 ? `Aumentar poupança em €${gap.toFixed(0)}/mês para atingir 15%` : '✓ Já poupam mais de 15%!',
          totalInvestments > 0 ? '✓ Continuem a diversificar o portfólio existente' : 'Começar com Certificados de Aforro (sem risco)',
          'PPR (Plano Poupança Reforma): benefício fiscal até €400/ano',
          totalInvestments === 0 || finances.investments.etfs === 0 ? 'ETFs indexados globais (ex: VWCE, IWDA): ~7% histórico' : '✓ Continuem com ETFs',
          'Nunca tirar este dinheiro - deixar crescer 20-30 anos',
          'Reforçar com aumentos salariais e subsídios',
          totalInvestments > 0 ? `Portfólio atual de €${totalInvestments.toFixed(0)} é um ótimo começo!` : 'Começar pequeno, mas começar JÁ'
        ]
      });
    }
    
    // PRIORITY 5: Already crushing it!
    else if (savingsRate >= 15 && finances.currentSavings >= recommendedEmergencyFund && totalNonMortgageDebt === 0) {
      const monthlyInvestment = monthlyDisposable;
      const yearlyInvestment = monthlyInvestment * 12;
      
      // 30-year projection
      const futureValue30 = yearlyInvestment * (((Math.pow(1.07, 30) - 1) / 0.07));
      
      // Calculate potential early retirement
      const currentAge = 30; // assumption
      const retirementNeeds = totalMonthlyExpenses * 12 * 25; // 25x annual expenses (4% rule)
      let yearsToFI = 0;
      let accumulated = finances.currentSavings;
      
      while (accumulated < retirementNeeds && yearsToFI < 50) {
        accumulated = accumulated * 1.07 + yearlyInvestment;
        yearsToFI++;
      }
      
      const retirementAge = currentAge + yearsToFI;
      
      recommendations.push({
        priority: 'Baixa',
        step: '🌟 PARABÉNS',
        category: '🚀 Otimização Avançada',
        action: `Estão no caminho certo! Sem dívidas, fundo emergência completo, e investem ${savingsRate.toFixed(0)}% do rendimento.`,
        impact: `Mantendo este ritmo (€${monthlyInvestment.toFixed(0)}/mês):\n• Em 30 anos: ~€${futureValue30.toFixed(0)}\n• Independência financeira possível em ~${yearsToFI} anos (idade ${retirementAge})\n• Com despesas de €${totalMonthlyExpenses.toFixed(0)}/mês, precisam de ~€${retirementNeeds.toFixed(0)} investidos`,
        timeline: 'Longo prazo - manter consistência',
        actionSteps: [
          'Continuar a investir mensalmente (automatizar)',
          'Maximizar benefícios fiscais (PPR até €400/ano)',
          'Diversificar: Certificados + ETFs + PPR',
          'Considerar aumentar para 20-25% se possível',
          'Rever estratégia anualmente',
          'Nunca parar - consistência é a chave!'
        ]
      });
    }
    
    // EXTRA: Excess savings that should be invested (unless saving for big purchase)
    const excessSavings = finances.currentSavings - recommendedEmergencyFund;
    if (excessSavings > 1000 && totalNonMortgageDebt === 0 && finances.currentSavings >= recommendedEmergencyFund) {
      // Calculate what the excess savings could become if invested
      const tenYearProjection = excessSavings * Math.pow(1.07, 10);
      const twentyYearProjection = excessSavings * Math.pow(1.07, 20);
      const thirtyYearProjection = excessSavings * Math.pow(1.07, 30);
      
      recommendations.push({
        priority: 'Média',
        step: 'OTIMIZAÇÃO',
        category: '💰 Excesso em Poupança',
        action: `Têm €${excessSavings.toFixed(0)} acima do fundo de emergência recomendado. Dinheiro parado perde valor com inflação!`,
        impact: `Se investirem este excesso a 7%/ano:\n• Em 10 anos: €${tenYearProjection.toFixed(0)} (+€${(tenYearProjection - excessSavings).toFixed(0)})\n• Em 20 anos: €${twentyYearProjection.toFixed(0)} (+€${(twentyYearProjection - excessSavings).toFixed(0)})\n• Em 30 anos: €${thirtyYearProjection.toFixed(0)} (+€${(thirtyYearProjection - excessSavings).toFixed(0)})\n\nVs. deixar parado: continua €${excessSavings.toFixed(0)} (perde valor com inflação)`,
        timeline: 'Considerar esta semana',
        actionSteps: [
          '⚠️ IMPORTANTE: Estão a poupar para algo específico? (casa, carro, casamento, etc.)',
          'Se SIM: manter em conta poupança se precisam nos próximos 3-5 anos',
          'Se NÃO: investir o excesso! Está a perder valor parado',
          'Opção 1: Certificados de Aforro (seguro, liquidez em 3 meses)',
          'Opção 2: ETFs globais para longo prazo (>10 anos)',
          'Opção 3: PPR (benefícios fiscais + investimento)',
          'Manter sempre o fundo emergência (€' + recommendedEmergencyFund.toFixed(0) + ') intocável!'
        ]
      });
    }
    
    // ADDITIONAL RECOMMENDATIONS
    
    // Critical: Negative savings
    if (savingsRate < 0) {
      recommendations.unshift({
        priority: 'EMERGÊNCIA',
        step: '⚠️ URGENTE',
        category: '🚨 Despesas > Rendimentos',
        action: `ALERTA CRÍTICO: Gastam €${Math.abs(monthlyDisposable).toFixed(0)}/mês MAIS do que ganham!`,
        impact: 'A situação actual é insustentável. Estão a criar dívida nova todos os meses.',
        timeline: 'RESOLVER ESTA SEMANA',
        actionSteps: [
          'PARAR todos os gastos não essenciais HOJE',
          'Listar TODAS as despesas e cortar 30-50%',
          'Vender possessões que não precisam',
          'Procurar rendimento extra (part-time, freelance)',
          'Contactar DECO para aconselhamento de dívida',
          'Não podem seguir os outros passos até equilibrar orçamento'
        ]
      });
    }
    
    // Housing costs too high
    const housingRatio = averageMonthlyIncome > 0 ? ((finances.rent + finances.condominium) / averageMonthlyIncome) * 100 : 0;
    if (housingRatio > 35) {
      const savingsIfReduced = ((housingRatio - 30) / 100 * averageMonthlyIncome) * 12;
      recommendations.push({
        priority: 'Média',
        step: 'OTIMIZAÇÃO',
        category: '🏠 Custo de Habitação',
        action: `Habitação custa ${housingRatio.toFixed(0)}% do rendimento (recomendado: máx 30-35%).`,
        impact: `Reduzir para 30% libertaria €${savingsIfReduced.toFixed(0)}/ano = aceleração significativa dos objetivos`,
        timeline: 'Considerar a médio prazo',
        actionSteps: [
          'Avaliar se podem mudar para zona mais barata',
          'Considerar roommate se aplicável',
          'Renegociar renda no próximo contrato',
          'Esta mudança pode acelerar liberdade financeira em anos'
        ]
      });
    }
    
    // Subscriptions waste
    if (finances.subscriptions > averageMonthlyIncome * 0.05) {
      const annualWaste = finances.subscriptions * 12;
      recommendations.push({
        priority: 'Baixa',
        step: 'OTIMIZAÇÃO',
        category: '📱 Subscrições',
        action: `Gastam €${finances.subscriptions.toFixed(0)}/mês (€${annualWaste.toFixed(0)}/ano) em subscrições.`,
        impact: `Cortar 50% = €${(annualWaste * 0.5).toFixed(0)}/ano para objetivos mais importantes`,
        timeline: 'Fazer esta semana',
        actionSteps: [
          'Listar TODAS as subscrições (ver extratos bancários)',
          'Cancelar as não usadas nos últimos 30 dias',
          'Partilhar contas familiares quando possível',
          'Usar versões gratuitas quando adequado'
        ]
      });
    }
    
    // Subsidios strategy
    if (finances.receivesSubsidios === 'yes') {
      const totalSubsidios = (finances.subsidioFerias || finances.monthlySalaryNet) + 
                            (finances.subsidioNatal || finances.monthlySalaryNet);
      
      let subsidioUse = '';
      if (finances.currentSavings < 1000) {
        subsidioUse = 'Completar €1000 de fundo inicial';
      } else if (totalNonMortgageDebt > 0) {
        subsidioUse = `Eliminar dívidas (atacar "${allDebts[0]?.name || 'dívida'}")`;
      } else if (finances.currentSavings < recommendedEmergencyFund) {
        subsidioUse = 'Construir fundo de emergência completo';
      } else {
        subsidioUse = 'Investir para o futuro';
      }
      
      recommendations.push({
        priority: 'Alta',
        step: 'ESTRATÉGIA',
        category: '🎁 Subsídios 2026',
        action: `Vão receber ~€${totalSubsidios.toFixed(0)} em subsídios este ano.`,
        impact: `Usar estrategicamente pode acelerar objectivos em MESES:\n• Subsídio Férias (Julho): ${subsidioUse}\n• Subsídio Natal (Novembro): ${subsidioUse}\n• NÃO gastar em luxos/férias caras`,
        timeline: 'Planear ANTES de receber',
        actionSteps: [
          'Decidir AGORA onde vai cada subsídio',
          'Transferir IMEDIATAMENTE ao receber',
          'Não deixar "aquecer" na conta principal',
          'Estes €' + totalSubsidios.toFixed(0) + ' podem mudar o vosso ano!'
        ]
      });
    }
    
    const planData = {
      income: {
        monthlySalary: finances.monthlySalaryNet,
        subsidios: subsidiosTotal,
        otherMonthly: finances.otherMonthlyIncome,
        averageMonthly: averageMonthlyIncome,
        yearly: totalYearlyIncome,
        yearlyBase: yearlyBaseSalary + yearlyOtherIncome
      },
      expenses: {
        fixed: monthlyFixedExpenses,
        variable: monthlyVariableExpenses,
        debt: monthlyDebtPayments,
        total: totalMonthlyExpenses
      },
      disposable: {
        monthly: monthlyDisposable,
        yearly: yearlyDisposable
      },
      debt: {
        totalDebt: totalDebt,
        monthlyPayment: monthlyDebtPayments,
        monthlyInterest: monthlyInterestPaid,
        yearlyInterest: yearlyInterestPaid,
        loans: finances.loans,
        creditCard: finances.creditCardDebt
      },
      savings: {
        rate: savingsRate,
        currentSavings: finances.currentSavings,
        recommendedEmergency: recommendedEmergencyFund,
        gap: emergencyFundGap,
        monthlyTarget: Math.max(0, monthlyDisposable),
        totalInvestments: totalInvestments,
        investmentBreakdown: finances.investments,
        hasInvestments: finances.hasInvestments,
        totalNetWorth: totalNetWorth
      },
      ratios: {
        expenseRatio: expenseRatio,
        housingRatio: housingRatio,
        debtRatio: averageMonthlyIncome > 0 ? (monthlyDebtPayments / averageMonthlyIncome) * 100 : 0,
        savingsRate: savingsRate
      },
      recommendations: recommendations.sort((a, b) => {
        const priority = { 'Crítica': 0, 'Muito Alta': 1, 'Alta': 2, 'Média': 3, 'Baixa': 4 };
        return priority[a.priority] - priority[b.priority];
      }),
      projection2026: {
        expectedSavings: Math.max(0, yearlyDisposable),
        endBalance: finances.currentSavings + Math.max(0, yearlyDisposable),
        interestPaid: yearlyInterestPaid
      }
    };
    
    setPlan(planData);
    setStep(6);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-green-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Rendimentos</h2>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          ℹ️ <strong>Nota:</strong> Em Portugal, a maioria dos trabalhadores recebe 14 meses de salário (12 meses + Subsídio de Férias + Subsídio de Natal)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Salário Líquido Mensal (€) *</label>
        <input
          type="number"
          value={finances.monthlySalaryNet}
          onChange={(e) => updateFinance('monthlySalaryNet', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg text-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">O que recebem por mês na conta (após impostos e Seg. Social)</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Recebem Subsídio de Férias e Natal?</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="yes"
              checked={finances.receivesSubsidios === 'yes'}
              onChange={(e) => updateFinance('receivesSubsidios', e.target.value)}
              className="mr-2"
            />
            Sim (14 meses)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="no"
              checked={finances.receivesSubsidios === 'no'}
              onChange={(e) => updateFinance('receivesSubsidios', e.target.value)}
              className="mr-2"
            />
            Não (12 meses)
          </label>
        </div>
      </div>

      {finances.receivesSubsidios === 'yes' && (
        <div className="bg-green-50 p-4 rounded-lg space-y-4">
          <p className="text-sm font-medium text-green-800">
            Por defeito, assumimos que os subsídios são iguais ao salário mensal. Se forem diferentes, indiquem abaixo:
          </p>
          
          <div>
            <label className="block text-sm font-medium mb-1">Subsídio de Férias (€)</label>
            <input
              type="number"
              value={finances.subsidioFerias}
              onChange={(e) => updateFinance('subsidioFerias', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
              placeholder={finances.monthlySalaryNet || "Igual ao salário mensal"}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Subsídio de Natal (€)</label>
            <input
              type="number"
              value={finances.subsidioNatal}
              onChange={(e) => updateFinance('subsidioNatal', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
              placeholder={finances.monthlySalaryNet || "Igual ao salário mensal"}
            />
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Outros Rendimentos Mensais (€)</label>
        <input
          type="number"
          value={finances.otherMonthlyIncome}
          onChange={(e) => updateFinance('otherMonthlyIncome', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Rendas, freelance, part-time, etc.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Outros Rendimentos Anuais (€)</label>
        <input
          type="number"
          value={finances.otherYearlyIncome}
          onChange={(e) => updateFinance('otherYearlyIncome', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Bónus, prémios, rendimentos ocasionais</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium mb-1">Número de Pessoas no Agregado</label>
        <input
          type="number"
          value={finances.household}
          onChange={(e) => updateFinance('household', parseInt(e.target.value) || 1)}
          className="w-full p-2 border rounded"
          placeholder="1"
          min="1"
        />
        <p className="text-xs text-gray-500 mt-1">Quantas pessoas vivem com este rendimento?</p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Home className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Despesas Fixas Mensais</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        São despesas que pagam todos os meses, sempre com o mesmo valor (ou quase).
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Renda ou Prestação da Casa (€)</label>
        <input
          type="number"
          value={finances.rent}
          onChange={(e) => updateFinance('rent', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Condomínio (€)</label>
        <input
          type="number"
          value={finances.condominium}
          onChange={(e) => updateFinance('condominium', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Contas: Luz, Água, Gás (€)</label>
        <input
          type="number"
          value={finances.utilities}
          onChange={(e) => updateFinance('utilities', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Média mensal</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Seguros (€)</label>
        <input
          type="number"
          value={finances.insurance}
          onChange={(e) => updateFinance('insurance', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Saúde, carro, casa, vida, etc. (total mensal)</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Telemóvel, Internet, TV (€)</label>
        <input
          type="number"
          value={finances.phoneInternet}
          onChange={(e) => updateFinance('phoneInternet', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Passe de Transportes (€)</label>
        <input
          type="number"
          value={finances.transportPass}
          onChange={(e) => updateFinance('transportPass', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Metro, comboio, autocarro</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="text-purple-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Despesas Variáveis Mensais</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Despesas que mudam de mês para mês. Coloquem uma média aproximada.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Supermercado e Mercearia (€)</label>
        <input
          type="number"
          value={finances.groceries}
          onChange={(e) => updateFinance('groceries', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Restaurantes, Cafés, Takeaway (€)</label>
        <input
          type="number"
          value={finances.dining}
          onChange={(e) => updateFinance('dining', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Entretenimento e Lazer (€)</label>
        <input
          type="number"
          value={finances.entertainment}
          onChange={(e) => updateFinance('entertainment', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Cinema, ginásio, hobbies, saídas</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Subscrições (€)</label>
        <input
          type="number"
          value={finances.subscriptions}
          onChange={(e) => updateFinance('subscriptions', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Netflix, Spotify, ginásio, jornais, etc.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Roupa e Calçado (€)</label>
        <input
          type="number"
          value={finances.clothing}
          onChange={(e) => updateFinance('clothing', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Saúde e Farmácia (€)</label>
        <input
          type="number"
          value={finances.health}
          onChange={(e) => updateFinance('health', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Médicos, dentistas, medicamentos</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Educação (€)</label>
        <input
          type="number"
          value={finances.education}
          onChange={(e) => updateFinance('education', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Propinas, explicações, creche, livros</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Animais de Estimação (€)</label>
        <input
          type="number"
          value={finances.pets}
          onChange={(e) => updateFinance('pets', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Comida, veterinário, etc.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Outras Despesas (€)</label>
        <input
          type="number"
          value={finances.other}
          onChange={(e) => updateFinance('other', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="text-red-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Empréstimos e Dívidas</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Listem todos os empréstimos que estão a pagar (crédito habitação, carro, pessoal, etc.)
      </p>

      <div className="space-y-4">
        {finances.loans.map((loan, index) => (
          <div key={loan.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Empréstimo {index + 1}</h3>
              <button
                onClick={() => removeLoan(loan.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nome/Tipo do Empréstimo</label>
                <input
                  type="text"
                  value={loan.name}
                  onChange={(e) => updateLoan(loan.id, 'name', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Ex: Crédito Habitação, Carro, Pessoal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Montante em Dívida (€)</label>
                  <input
                    type="number"
                    value={loan.totalAmount}
                    onChange={(e) => updateLoan(loan.id, 'totalAmount', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Prestação Mensal (€)</label>
                  <input
                    type="number"
                    value={loan.monthlyPayment}
                    onChange={(e) => updateLoan(loan.id, 'monthlyPayment', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Taxa de Juro Anual (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={loan.interestRate}
                    onChange={(e) => updateLoan(loan.id, 'interestRate', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Meses Restantes (aprox.)</label>
                  <input
                    type="number"
                    value={loan.remainingMonths}
                    onChange={(e) => updateLoan(loan.id, 'remainingMonths', parseInt(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addLoan}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <Plus size={20} />
          Adicionar Empréstimo
        </button>
      </div>

      <div className="mt-6 border-t-2 pt-6">
        <h3 className="font-semibold text-lg mb-4">Cartão de Crédito</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Dívida Total do Cartão (€)</label>
          <input
            type="number"
            value={finances.creditCardDebt}
            onChange={(e) => updateFinance('creditCardDebt', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border rounded-lg"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">Quanto devem no total?</p>
        </div>

        {finances.creditCardDebt > 0 && (
          <>
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">Pagamento Mensal do Cartão (€)</label>
              <input
                type="number"
                value={finances.creditCardMonthlyPayment}
                onChange={(e) => updateFinance('creditCardMonthlyPayment', parseFloat(e.target.value) || 0)}
                className="w-full p-3 border rounded-lg"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Quanto pagam por mês?</p>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">Taxa de Juro Anual (%)</label>
              <input
                type="number"
                step="0.1"
                value={finances.creditCardInterestRate}
                onChange={(e) => updateFinance('creditCardInterestRate', parseFloat(e.target.value) || 18)}
                className="w-full p-3 border rounded-lg"
                placeholder="18"
              />
              <p className="text-xs text-gray-500 mt-1">Normalmente 15-22% em Portugal</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <PiggyBank className="text-green-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Poupança, Investimentos e Objetivos</h2>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Poupança Atual Total (€)</label>
        <input
          type="number"
          value={finances.currentSavings}
          onChange={(e) => updateFinance('currentSavings', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg text-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Dinheiro em contas poupança, contas à ordem disponíveis, etc.</p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm">
          <strong>Fundo de Emergência:</strong> Vamos calcular automaticamente quanto devem ter guardado para emergências (normalmente 3-6 meses de despesas).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Objetivo de Poupança para 2026 (€)</label>
        <input
          type="number"
          value={finances.savingsGoal2026}
          onChange={(e) => updateFinance('savingsGoal2026', parseFloat(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Quanto gostariam de poupar durante o ano de 2026?</p>
      </div>

      <div className="border-t-2 pt-4 mt-6">
        <h3 className="font-semibold text-lg mb-3">💰 Investimentos Atuais</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Têm investimentos atualmente?</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="no"
                checked={finances.hasInvestments === 'no'}
                onChange={(e) => updateFinance('hasInvestments', e.target.value)}
                className="mr-2"
              />
              Não
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="yes"
                checked={finances.hasInvestments === 'yes'}
                onChange={(e) => updateFinance('hasInvestments', e.target.value)}
                className="mr-2"
              />
              Sim
            </label>
          </div>
        </div>

        {finances.hasInvestments === 'yes' && (
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <p className="text-sm font-medium text-green-800 mb-3">
              Quanto têm investido em cada categoria? (deixar 0 se não aplicável)
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-1">Certificados de Aforro / Tesouro (€)</label>
              <input
                type="number"
                value={finances.investments.certificadosAforro}
                onChange={(e) => {
                  const newInvestments = { ...finances.investments, certificadosAforro: parseFloat(e.target.value) || 0 };
                  updateFinance('investments', newInvestments);
                }}
                className="w-full p-2 border rounded"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">PPR - Plano Poupança Reforma (€)</label>
              <input
                type="number"
                value={finances.investments.ppr}
                onChange={(e) => {
                  const newInvestments = { ...finances.investments, ppr: parseFloat(e.target.value) || 0 };
                  updateFinance('investments', newInvestments);
                }}
                className="w-full p-2 border rounded"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ETFs (ex: VWCE, IWDA) (€)</label>
              <input
                type="number"
                value={finances.investments.etfs}
                onChange={(e) => {
                  const newInvestments = { ...finances.investments, etfs: parseFloat(e.target.value) || 0 };
                  updateFinance('investments', newInvestments);
                }}
                className="w-full p-2 border rounded"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ações Individuais (€)</label>
              <input
                type="number"
                value={finances.investments.acoes}
                onChange={(e) => {
                  const newInvestments = { ...finances.investments, acoes: parseFloat(e.target.value) || 0 };
                  updateFinance('investments', newInvestments);
                }}
                className="w-full p-2 border rounded"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fundos de Investimento (€)</label>
              <input
                type="number"
                value={finances.investments.fundos}
                onChange={(e) => {
                  const newInvestments = { ...finances.investments, fundos: parseFloat(e.target.value) || 0 };
                  updateFinance('investments', newInvestments);
                }}
                className="w-full p-2 border rounded"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Criptomoedas (€)</label>
              <input
                type="number"
                value={finances.investments.crypto}
                onChange={(e) => {
                  const newInvestments = { ...finances.investments, crypto: parseFloat(e.target.value) || 0 };
                  updateFinance('investments', newInvestments);
                }}
                className="w-full p-2 border rounded"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Outros Investimentos (€)</label>
              <input
                type="number"
                value={finances.investments.outros}
                onChange={(e) => {
                  const newInvestments = { ...finances.investments, outros: parseFloat(e.target.value) || 0 };
                  updateFinance('investments', newInvestments);
                }}
                className="w-full p-2 border rounded"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Imóveis para investimento, ouro, etc.</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Número de Dependentes</label>
        <input
          type="number"
          value={finances.dependents}
          onChange={(e) => updateFinance('dependents', parseInt(e.target.value) || 0)}
          className="w-full p-3 border rounded-lg"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Filhos ou outros dependentes financeiros</p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg mt-6">
        <h3 className="font-semibold mb-2">✅ Pronto para gerar o plano!</h3>
        <p className="text-sm text-gray-700">
          Já têm toda a informação necessária. Vamos analisar a vossa situação e criar um plano personalizado para 2026.
        </p>
      </div>
    </div>
  );

  const renderPlan = () => {
    if (!plan) return null;

    const getHealthStatus = (ratio) => {
      if (ratio >= 20) return { text: 'Excelente', color: 'text-green-600', bg: 'bg-green-100', icon: '🌟' };
      if (ratio >= 15) return { text: 'Muito Bom', color: 'text-green-600', bg: 'bg-green-100', icon: '✅' };
      if (ratio >= 10) return { text: 'Bom', color: 'text-blue-600', bg: 'bg-blue-100', icon: '👍' };
      if (ratio >= 5) return { text: 'Razoável', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⚠️' };
      if (ratio >= 0) return { text: 'Preocupante', color: 'text-orange-600', bg: 'bg-orange-100', icon: '⚠️' };
      return { text: 'Crítico', color: 'text-red-600', bg: 'bg-red-100', icon: '🚨' };
    };

    const healthStatus = getHealthStatus(plan.savings.rate);

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">📊 Plano Financeiro 2026</h2>
          <p className="text-gray-600">Análise personalizada e recomendações práticas</p>
        </div>

        {/* Encouraging Message */}
        <div className={`rounded-lg p-4 border-2 ${
          plan.savings.rate < 0 ? 'bg-red-50 border-red-300' :
          plan.debt.totalDebt > plan.income.yearly && plan.savings.rate < 5 ? 'bg-orange-50 border-orange-300' :
          plan.savings.rate < 10 ? 'bg-yellow-50 border-yellow-300' :
          plan.savings.rate >= 15 && plan.debt.totalDebt === 0 && plan.savings.currentSavings >= plan.savings.recommendedEmergency ? 'bg-green-50 border-green-300' :
          'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {plan.savings.rate < 0 ? '💪' :
               plan.debt.totalDebt > plan.income.yearly && plan.savings.rate < 5 ? '🌱' :
               plan.savings.rate < 10 ? '👍' :
               plan.savings.rate >= 15 && plan.debt.totalDebt === 0 && plan.savings.currentSavings >= plan.savings.recommendedEmergency ? '⭐' :
               '🚀'}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 mb-1">
                {plan.savings.rate < 0 ? 'Vamos dar a volta a isto juntos!' :
                 plan.debt.totalDebt > plan.income.yearly && plan.savings.rate < 5 ? 'Cada grande jornada começa com um primeiro passo!' :
                 plan.savings.rate < 10 ? 'Estão no caminho certo!' :
                 plan.savings.rate >= 15 && plan.debt.totalDebt === 0 && plan.savings.currentSavings >= plan.savings.recommendedEmergency ? 'Parabéns! Estão a fazer um trabalho incrível!' :
                 'Bom progresso! Vamos optimizar ainda mais!'}
              </p>
              <p className="text-sm text-gray-700">
                {plan.savings.rate < 0 ? 
                  'A situação é desafiante, mas NÃO é impossível. Milhares de famílias já estiveram onde estão e conseguiram dar a volta. O plano abaixo vai mostrar-vos o caminho, passo a passo. Não desistam - cada pequena mudança conta!' :
                 plan.debt.totalDebt > plan.income.yearly && plan.savings.rate < 5 ?
                  'Sabemos que lidar com dívidas é stressante, mas o facto de estarem aqui a fazer um plano já vos coloca à frente de 90% das pessoas. Seguindo os passos abaixo com consistência, vão ver progresso real. Acreditem no processo!' :
                 plan.savings.rate < 10 ?
                  'Já estão a poupar e isso é fantástico! Com alguns ajustes estratégicos que vamos recomendar, podem acelerar significativamente os vossos objetivos. Continuem com essa disciplina!' :
                 plan.savings.rate >= 15 && plan.debt.totalDebt === 0 && plan.savings.currentSavings >= plan.savings.recommendedEmergency ?
                  `Estão entre os ${plan.savings.rate >= 20 ? '5%' : '10%'} mais responsáveis financeiramente! Sem dívidas, com fundo de emergência completo, e a investir regularmente. Isto é liberdade financeira em construção. Mantenham o foco no longo prazo!` :
                 'Já têm bons hábitos estabelecidos. Agora vamos afinar a estratégia para maximizar o vosso potencial. Com as mudanças certas, 2026 pode ser o melhor ano financeiro até agora!'}
              </p>
              {plan.savings.totalInvestments > 0 && (
                <p className="text-sm text-gray-700 mt-2 italic">
                  💼 Excelente trabalho em já terem €{plan.savings.totalInvestments.toFixed(0)} investidos! Isto mostra visão de longo prazo.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print-section">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-700 font-medium">💰 Rendimento Mensal</p>
            <p className="text-2xl font-bold text-blue-700">€{plan.income.averageMonthly.toFixed(0)}</p>
            <p className="text-xs text-gray-600 mt-1">
              €{plan.income.yearly.toFixed(0)}/ano total
              {plan.income.subsidios > 0 && (
                <><br /><span className="text-blue-600 font-semibold">+ €{plan.income.subsidios.toFixed(0)} subsídios</span></>
              )}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-200">
            <p className="text-sm text-gray-700 font-medium">💸 Despesas Mensais</p>
            <p className="text-2xl font-bold text-red-700">€{plan.expenses.total.toFixed(0)}</p>
            <p className="text-xs text-gray-600 mt-1">{plan.ratios.expenseRatio.toFixed(0)}% do rendimento</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
            <p className="text-sm text-gray-700 font-medium">💵 Disponível/Mês</p>
            <p className={`text-2xl font-bold ${plan.disposable.monthly >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              €{plan.disposable.monthly.toFixed(0)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {plan.disposable.monthly >= 0 ? 'Para poupar' : 'Défice mensal'}
            </p>
          </div>

          <div className={`bg-gradient-to-br p-4 rounded-lg border-2 ${
            plan.savings.rate >= 15 ? 'from-green-50 to-green-100 border-green-200' :
            plan.savings.rate >= 5 ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
            'from-red-50 to-red-100 border-red-200'
          }`}>
            <p className="text-sm text-gray-700 font-medium">{healthStatus.icon} Taxa Poupança</p>
            <p className={`text-2xl font-bold ${healthStatus.color}`}>
              {plan.savings.rate.toFixed(1)}%
            </p>
            <p className={`text-xs font-semibold mt-1 ${healthStatus.color}`}>{healthStatus.text}</p>
          </div>
        </div>

        {/* Subsidios Info */}
        {plan.income.subsidios > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded print-section">
            <h3 className="font-bold text-lg mb-2">🎁 Subsídios de Férias e Natal</h3>
            <p className="mb-2">
              Vão receber <strong>€{plan.income.subsidios.toFixed(0)}</strong> em subsídios este ano (normalmente em Julho e Novembro).
            </p>
            <p className="text-sm text-orange-800 mb-2">
              <strong>💡 Filosofia importante:</strong> Os subsídios NÃO estão incluídos no vosso orçamento mensal acima. 
              São dinheiro EXTRA que deve ser usado estrategicamente para objetivos financeiros.
            </p>
            <p className="text-sm text-orange-800">
              <strong>Como usar:</strong> Pagar dívidas, construir fundo de emergência, ou investir. 
              Evitar gastar em luxos ou férias caras - isto pode acelerar os vossos objetivos em MESES!
            </p>
          </div>
        )}

        {/* CRITICAL WARNINGS */}
        {plan.savings.rate < 0 && (
          <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded print-section">
            <h3 className="font-bold text-lg text-red-800 mb-2">🚨 SITUAÇÃO CRÍTICA</h3>
            <p className="text-red-900 font-semibold mb-2">
              Estão a gastar €{Math.abs(plan.disposable.monthly).toFixed(0)} mais por mês do que ganham!
            </p>
            <p className="text-sm text-red-800">
              Isto significa que estão a aumentar dívidas ou a esgotar poupanças. É urgente cortar despesas ou aumentar rendimentos.
            </p>
          </div>
        )}

        {/* Debt Warning */}
        {plan.debt.totalDebt > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded print-section">
            <h3 className="font-bold text-lg mb-2">💳 Resumo de Dívidas</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-600">Total em Dívida</p>
                <p className="text-xl font-bold text-orange-700">€{plan.debt.totalDebt.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Juros Pagos/Ano</p>
                <p className="text-xl font-bold text-red-600">€{plan.debt.yearlyInterest.toFixed(0)}</p>
              </div>
            </div>
            <p className="text-sm text-orange-800">
              Estão a pagar <strong>€{plan.debt.monthlyInterest.toFixed(0)}/mês</strong> só em juros. 
              Reduzir dívidas devia ser uma prioridade.
            </p>
          </div>
        )}

        {/* Emergency Fund Status */}
        <div className={`border-l-4 p-4 rounded print-section ${
          plan.savings.gap === 0 ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'
        }`}>
          <h3 className="font-bold text-lg mb-2">
            {plan.savings.gap === 0 ? '✅ Fundo de Emergência' : '⚠️ Fundo de Emergência'}
          </h3>
          {plan.savings.gap === 0 ? (
            <p className="text-green-800">
              Parabéns! Têm um fundo de emergência adequado de <strong>€{plan.savings.currentSavings.toFixed(0)}</strong>.
            </p>
          ) : (
            <>
              <p className="mb-2">
                Recomendamos ter <strong>€{plan.savings.recommendedEmergency.toFixed(0)}</strong> guardados para emergências (6 meses de despesas).
              </p>
              <p className="text-xs text-yellow-700 mb-2 italic">
                ℹ️ A recomendação standard é 3-6 meses. Usamos 6 meses para maior segurança, mas se atingirem 3 meses (€{(plan.savings.recommendedEmergency / 2).toFixed(0)}) já têm uma boa proteção básica.
              </p>
              <p className="text-yellow-800 font-semibold">
                Faltam €{plan.savings.gap.toFixed(0)} para atingir este objetivo.
              </p>
              {plan.disposable.monthly > 0 && (
                <p className="text-sm text-gray-700 mt-2">
                  Poupando €{plan.savings.monthlyTarget.toFixed(0)}/mês, podem atingir isto em {Math.ceil(plan.savings.gap / plan.savings.monthlyTarget)} meses.
                </p>
              )}
            </>
          )}
        </div>

        {/* Projection 2026 */}
        {plan.disposable.yearly > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 p-4 rounded-lg print-section">
            <h3 className="font-bold text-lg mb-2">🎯 Projeção para Final de 2026</h3>
            <p className="mb-2">
              Se mantiverem este padrão de gastos, até 31 de Dezembro de 2026 terão:
            </p>
            <div className="bg-white p-3 rounded border-2 border-green-400">
              <p className="text-3xl font-bold text-green-700 text-center">
                €{plan.projection2026.endBalance.toFixed(0)}
              </p>
              <p className="text-sm text-gray-600 text-center mt-1">
                (Poupança actual: €{plan.savings.currentSavings.toFixed(0)} + Poupança 2026: €{plan.projection2026.expectedSavings.toFixed(0)})
              </p>
            </div>
          </div>
        )}

        {/* Key Ratios */}
        <div className="bg-white border-2 rounded-lg p-4 print-section">
          <h3 className="font-bold text-lg mb-3">📈 Rácios Financeiros</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Habitação / Rendimento</span>
                <span className={`font-semibold ${plan.ratios.housingRatio > 35 ? 'text-red-600' : 'text-green-600'}`}>
                  {plan.ratios.housingRatio.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div 
                  className={`h-2 rounded ${plan.ratios.housingRatio > 35 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{width: `${Math.min(plan.ratios.housingRatio, 100)}%`}}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Recomendado: máximo 30-35%</p>
            </div>

            {plan.ratios.debtRatio > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Dívidas / Rendimento</span>
                  <span className={`font-semibold ${plan.ratios.debtRatio > 35 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {plan.ratios.debtRatio.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div 
                    className={`h-2 rounded ${plan.ratios.debtRatio > 35 ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{width: `${Math.min(plan.ratios.debtRatio, 100)}%`}}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Recomendado: máximo 35-40%</p>
              </div>
            )}

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Taxa de Poupança</span>
                <span className={`font-semibold ${healthStatus.color}`}>
                  {plan.savings.rate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div 
                  className={`h-2 rounded ${
                    plan.savings.rate >= 20 ? 'bg-green-500' :
                    plan.savings.rate >= 10 ? 'bg-blue-500' :
                    plan.savings.rate >= 5 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{width: `${Math.min(Math.max(plan.savings.rate, 0), 100)}%`}}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Recomendado: mínimo 15-20%</p>
            </div>
          </div>
        </div>

        {/* Investment Portfolio Summary */}
        {plan.savings.hasInvestments === 'yes' && plan.savings.totalInvestments > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-4 rounded-lg border-2 border-purple-200 print-section">
            <h3 className="font-bold text-lg mb-3">💼 Portfólio de Investimentos</h3>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-700">Total Investido</p>
                <p className="text-3xl font-bold text-purple-700">€{plan.savings.totalInvestments.toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700">Valor Líquido Total</p>
                <p className={`text-2xl font-bold ${plan.savings.totalNetWorth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  €{plan.savings.totalNetWorth.toFixed(0)}
                </p>
                <p className="text-xs text-gray-600">(Poupança + Investimentos - Dívidas)</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {plan.savings.investmentBreakdown.certificadosAforro > 0 && (
                <div className="bg-white bg-opacity-70 rounded p-2">
                  <p className="text-gray-600">Certificados</p>
                  <p className="font-semibold text-purple-700">€{plan.savings.investmentBreakdown.certificadosAforro.toFixed(0)}</p>
                </div>
              )}
              {plan.savings.investmentBreakdown.ppr > 0 && (
                <div className="bg-white bg-opacity-70 rounded p-2">
                  <p className="text-gray-600">PPR</p>
                  <p className="font-semibold text-purple-700">€{plan.savings.investmentBreakdown.ppr.toFixed(0)}</p>
                </div>
              )}
              {plan.savings.investmentBreakdown.etfs > 0 && (
                <div className="bg-white bg-opacity-70 rounded p-2">
                  <p className="text-gray-600">ETFs</p>
                  <p className="font-semibold text-purple-700">€{plan.savings.investmentBreakdown.etfs.toFixed(0)}</p>
                </div>
              )}
              {plan.savings.investmentBreakdown.acoes > 0 && (
                <div className="bg-white bg-opacity-70 rounded p-2">
                  <p className="text-gray-600">Ações</p>
                  <p className="font-semibold text-purple-700">€{plan.savings.investmentBreakdown.acoes.toFixed(0)}</p>
                </div>
              )}
              {plan.savings.investmentBreakdown.fundos > 0 && (
                <div className="bg-white bg-opacity-70 rounded p-2">
                  <p className="text-gray-600">Fundos</p>
                  <p className="font-semibold text-purple-700">€{plan.savings.investmentBreakdown.fundos.toFixed(0)}</p>
                </div>
              )}
              {plan.savings.investmentBreakdown.crypto > 0 && (
                <div className="bg-white bg-opacity-70 rounded p-2">
                  <p className="text-gray-600">Crypto</p>
                  <p className="font-semibold text-purple-700">€{plan.savings.investmentBreakdown.crypto.toFixed(0)}</p>
                </div>
              )}
              {plan.savings.investmentBreakdown.outros > 0 && (
                <div className="bg-white bg-opacity-70 rounded p-2">
                  <p className="text-gray-600">Outros</p>
                  <p className="font-semibold text-purple-700">€{plan.savings.investmentBreakdown.outros.toFixed(0)}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-3 italic">
              💡 Excelente! Já têm uma base de investimentos. Continuem a diversificar e a investir regularmente.
            </p>
          </div>
        )}

        {/* Recommendations */}
        {plan.recommendations.length > 0 && (
          <div className="bg-white border-2 rounded-lg p-4 print-page-break print-section">
            <h3 className="font-bold text-xl mb-4">✨ Recomendações Prioritárias</h3>
            <p className="text-sm text-gray-600 mb-4">
              Seguir estes passos pela ordem vai maximizar o vosso progresso financeiro:
            </p>
            <div className="space-y-4">
              {plan.recommendations.map((rec, idx) => (
                <div key={idx} className={`border-l-4 pl-4 py-3 rounded-r recommendation-card ${
                  rec.priority === 'EMERGÊNCIA' ? 'border-red-900 bg-red-100' :
                  rec.priority === 'Crítica' ? 'border-red-600 bg-red-50' :
                  rec.priority === 'Muito Alta' ? 'border-orange-500 bg-orange-50' :
                  rec.priority === 'Alta' ? 'border-yellow-500 bg-yellow-50' :
                  rec.priority === 'Média' ? 'border-blue-500 bg-blue-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {rec.step && (
                        <span className={`text-xs px-2 py-1 rounded font-bold ${
                          rec.priority === 'EMERGÊNCIA' ? 'bg-red-200 text-red-900' :
                          rec.priority === 'Crítica' ? 'bg-red-200 text-red-800' :
                          rec.priority === 'Muito Alta' ? 'bg-orange-200 text-orange-800' :
                          rec.priority === 'Alta' ? 'bg-yellow-200 text-yellow-800' :
                          rec.priority === 'Média' ? 'bg-blue-200 text-blue-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {rec.step}
                        </span>
                      )}
                      <span className="font-bold text-base">{rec.category}</span>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      rec.priority === 'EMERGÊNCIA' ? 'bg-red-300 text-red-900' :
                      rec.priority === 'Crítica' ? 'bg-red-200 text-red-800' :
                      rec.priority === 'Muito Alta' ? 'bg-orange-200 text-orange-800' :
                      rec.priority === 'Alta' ? 'bg-yellow-200 text-yellow-800' :
                      rec.priority === 'Média' ? 'bg-blue-200 text-blue-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm mb-2 font-medium whitespace-pre-line">{rec.action}</p>
                  {rec.timeline && (
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      ⏰ {rec.timeline}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 italic mb-3 whitespace-pre-line">💡 {rec.impact}</p>
                  {rec.actionSteps && (
                    <div className="bg-white bg-opacity-70 rounded p-3 mt-2">
                      <p className="text-xs font-semibold mb-2">Passos concretos:</p>
                      <ul className="text-xs space-y-1">
                        {rec.actionSteps.map((step, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Recommendations - Detailed Analysis */}
        <div className="bg-white border-2 rounded-lg p-4 print-section">
          <h3 className="font-bold text-xl mb-4">📋 Análise Completa e Recomendações Detalhadas</h3>
          
          <div className="space-y-4">
            {/* Monthly Budget Analysis */}
            <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r">
              <h4 className="font-semibold text-base mb-2">💰 Análise do Orçamento Mensal</h4>
              <div className="text-sm space-y-2">
                <p><strong>Rendimento médio mensal:</strong> €{plan.income.averageMonthly.toFixed(0)}</p>
                <p><strong>Despesas fixas:</strong> €{plan.expenses.fixed.toFixed(0)} ({((plan.expenses.fixed/plan.income.averageMonthly)*100).toFixed(0)}%)</p>
                <p><strong>Despesas variáveis:</strong> €{plan.expenses.variable.toFixed(0)} ({((plan.expenses.variable/plan.income.averageMonthly)*100).toFixed(0)}%)</p>
                {plan.expenses.debt > 0 && (
                  <p><strong>Pagamentos de dívidas:</strong> €{plan.expenses.debt.toFixed(0)} ({((plan.expenses.debt/plan.income.averageMonthly)*100).toFixed(0)}%)</p>
                )}
                <p className={`font-semibold ${plan.disposable.monthly >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  <strong>Saldo mensal:</strong> €{plan.disposable.monthly.toFixed(0)}
                </p>
              </div>
              <div className="mt-3 bg-white p-2 rounded text-xs">
                <p className="font-semibold mb-1">💡 Recomendação:</p>
                {plan.disposable.monthly < 0 ? (
                  <p>URGENTE: Precisam de reduzir despesas ou aumentar rendimentos. O défice mensal está a criar dívida.</p>
                ) : plan.disposable.monthly < plan.income.averageMonthly * 0.10 ? (
                  <p>Taxa de poupança baixa. Tentem cortar 10-15% das despesas variáveis para aumentar margem de manobra.</p>
                ) : plan.disposable.monthly < plan.income.averageMonthly * 0.20 ? (
                  <p>Boa margem de poupança. Foquem-se em optimizar ainda mais para atingir 20%.</p>
                ) : (
                  <p>Excelente gestão financeira! Mantenham esta disciplina e os resultados vão aparecer.</p>
                )}
              </div>
            </div>

            {/* Debt Analysis */}
            {plan.debt.totalDebt > 0 && (
              <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded-r">
                <h4 className="font-semibold text-base mb-2">💳 Análise de Dívidas</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Dívida total:</strong> €{plan.debt.totalDebt.toFixed(0)}</p>
                  <p><strong>Pagamentos mensais:</strong> €{plan.debt.monthlyPayment.toFixed(0)}</p>
                  <p><strong>Juros pagos por mês:</strong> €{plan.debt.monthlyInterest.toFixed(0)}</p>
                  <p className="text-red-700 font-semibold"><strong>Juros pagos por ano:</strong> €{plan.debt.yearlyInterest.toFixed(0)}</p>
                </div>
                <div className="mt-3 bg-white p-2 rounded text-xs">
                  <p className="font-semibold mb-1">💡 Estratégia:</p>
                  <p>Cada euro em juros é dinheiro perdido. Priorizar pagar dívidas (especialmente com juros &gt;7%) antes de investir vai poupar milhares de euros a longo prazo. Considerar usar subsídios inteiros para eliminar dívidas mais rápido.</p>
                </div>
              </div>
            )}

            {/* Savings & Investment Strategy */}
            <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 rounded-r">
              <h4 className="font-semibold text-base mb-2">📈 Estratégia de Poupança e Investimento</h4>
              <div className="text-sm space-y-2">
                <p><strong>Poupança actual:</strong> €{plan.savings.currentSavings.toFixed(0)}</p>
                <p><strong>Taxa de poupança:</strong> {plan.savings.rate.toFixed(1)}%</p>
                <p><strong>Capacidade mensal:</strong> €{Math.max(0, plan.disposable.monthly).toFixed(0)}</p>
                {plan.savings.gap > 0 && (
                  <p><strong>Falta para fundo emergência:</strong> €{plan.savings.gap.toFixed(0)}</p>
                )}
              </div>
              <div className="mt-3 bg-white p-2 rounded text-xs">
                <p className="font-semibold mb-1">💡 Plano de ação:</p>
                {plan.savings.currentSavings < 1000 ? (
                  <p>Prioridade #1: Guardar €1000 o mais rápido possível. Este é o vosso colchão inicial contra emergências pequenas.</p>
                ) : plan.debt.totalDebt > 0 ? (
                  <p>Com €1000 guardados, focar em eliminar dívidas. Manter apenas o fundo inicial até ficarem livres de dívidas.</p>
                ) : plan.savings.gap > 0 ? (
                  <p>Sem dívidas! Agora construir fundo completo de €{plan.savings.recommendedEmergency.toFixed(0)}. Quando atingirem, podem começar a investir tranquilos.</p>
                ) : (
                  <p>Base sólida estabelecida! Agora focar em investir 15% do rendimento de forma consistente para construir riqueza a longo prazo.</p>
                )}
              </div>
            </div>

            {/* Housing Optimization */}
            {plan.ratios.housingRatio > 30 && (
              <div className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50 rounded-r">
                <h4 className="font-semibold text-base mb-2">🏠 Optimização de Habitação</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Custo de habitação:</strong> €{(finances.rent + finances.condominium).toFixed(0)}/mês</p>
                  <p><strong>Percentagem do rendimento:</strong> {plan.ratios.housingRatio.toFixed(0)}%</p>
                  <p className="text-orange-700"><strong>Recomendado:</strong> 30-35% máximo</p>
                  <p><strong>Excesso:</strong> €{(((plan.ratios.housingRatio - 30) / 100) * plan.income.averageMonthly).toFixed(0)}/mês</p>
                </div>
                <div className="mt-3 bg-white p-2 rounded text-xs">
                  <p className="font-semibold mb-1">💡 Opções:</p>
                  <p>Habitação é a maior despesa da maioria das famílias. Se conseguirem reduzir para 30% (€{(plan.income.averageMonthly * 0.30).toFixed(0)}/mês), libertam €{((plan.ratios.housingRatio - 30) / 100 * plan.income.averageMonthly * 12).toFixed(0)}/ano para outros objectivos. Considerar: mudança para zona mais económica, partilhar custos, ou renegociar renda.</p>
                </div>
              </div>
            )}

            {/* Variable Expenses Optimization */}
            <div className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50 rounded-r">
              <h4 className="font-semibold text-base mb-2">🛒 Optimização de Despesas Variáveis</h4>
              <div className="text-sm space-y-2">
                <p><strong>Supermercado:</strong> €{finances.groceries}/mês</p>
                <p><strong>Restaurantes:</strong> €{finances.dining}/mês</p>
                <p><strong>Entretenimento:</strong> €{finances.entertainment}/mês</p>
                <p><strong>Subscrições:</strong> €{finances.subscriptions}/mês</p>
                <p className="font-semibold"><strong>Total variável:</strong> €{plan.expenses.variable.toFixed(0)}/mês ({((plan.expenses.variable/plan.income.averageMonthly)*100).toFixed(0)}%)</p>
              </div>
              <div className="mt-3 bg-white p-2 rounded text-xs">
                <p className="font-semibold mb-1">💡 Oportunidades de poupança:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {finances.dining > plan.income.averageMonthly * 0.05 && (
                    <li>Reduzir restaurantes em 50% = €{(finances.dining * 0.5 * 12).toFixed(0)}/ano</li>
                  )}
                  {finances.subscriptions > 50 && (
                    <li>Cancelar subscrições não usadas = €{(finances.subscriptions * 0.3 * 12).toFixed(0)}/ano</li>
                  )}
                  {finances.groceries > plan.income.averageMonthly * 0.15 && (
                    <li>Meal prep e lista de compras = €{(finances.groceries * 0.15 * 12).toFixed(0)}/ano</li>
                  )}
                  {finances.entertainment > plan.income.averageMonthly * 0.05 && (
                    <li>Opções gratuitas/mais baratas = €{(finances.entertainment * 0.3 * 12).toFixed(0)}/ano</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Tax & Benefits Optimization */}
            <div className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50 rounded-r">
              <h4 className="font-semibold text-base mb-2">🎯 Optimização Fiscal e Benefícios</h4>
              <div className="text-sm space-y-2">
                <p><strong>Benefícios fiscais disponíveis em Portugal:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                  <li><strong>PPR:</strong> Dedução de até 20% (máx €400/ano para &lt;35 anos, €350 para 35-50 anos)</li>
                  <li><strong>Saúde:</strong> 15% de despesas (máx €1000)</li>
                  <li><strong>Educação:</strong> 30% de despesas (máx €800)</li>
                  <li><strong>Agregado familiar:</strong> Podem beneficiar de deduções adicionais</li>
                </ul>
              </div>
              <div className="mt-3 bg-white p-2 rounded text-xs">
                <p className="font-semibold mb-1">💡 Acção:</p>
                <p>Se investirem €2000/ano num PPR, podem recuperar até €400 no IRS. Isto é um retorno garantido de 20% no primeiro ano! Consultar contabilista para maximizar deduções.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4 print-section">
          <h3 className="font-bold text-xl mb-3">💬 Precisam de Ajuda?</h3>
          <p className="text-sm mb-4">
            Este planeador dá-vos uma visão geral, mas cada situação é única. Se tiverem dúvidas ou quiserem 
            discutir a vossa situação específica, estou disponível para ajudar!
          </p>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="font-semibold mb-3">Falar com o Diogo:</p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-purple-600">💬</span>
                <span>Enviar mensagem pelo WhatsApp</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-purple-600">📞</span>
                <span>Ligar quando quiserem</span>
              </p>
            </div>
            <p className="text-xs text-gray-600 mt-3 italic">
              Posso ajudar a clarificar dúvidas, rever o vosso plano, ou simplesmente dar apoio na vossa jornada financeira. 
              É sempre mais fácil quando temos alguém para nos guiar! 😊
            </p>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white border-2 rounded-lg p-4 print-section">
          <h3 className="font-bold text-lg mb-4">📊 Distribuição de Despesas</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Despesas Fixas</span>
                <span className="font-semibold">€{plan.expenses.fixed.toFixed(0)} ({((plan.expenses.fixed/plan.income.averageMonthly)*100).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-3">
                <div 
                  className="bg-blue-500 h-3 rounded"
                  style={{width: `${(plan.expenses.fixed / plan.income.averageMonthly) * 100}%`}}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Despesas Variáveis</span>
                <span className="font-semibold">€{plan.expenses.variable.toFixed(0)} ({((plan.expenses.variable/plan.income.averageMonthly)*100).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-3">
                <div 
                  className="bg-purple-500 h-3 rounded"
                  style={{width: `${(plan.expenses.variable / plan.income.averageMonthly) * 100}%`}}
                />
              </div>
            </div>
            
            {plan.expenses.debt > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Dívidas</span>
                  <span className="font-semibold text-red-600">€{plan.expenses.debt.toFixed(0)} ({((plan.expenses.debt/plan.income.averageMonthly)*100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-3">
                  <div 
                    className="bg-red-500 h-3 rounded"
                    style={{width: `${(plan.expenses.debt / plan.income.averageMonthly) * 100}%`}}
                  />
                </div>
              </div>
            )}
            
            {plan.disposable.monthly > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Disponível para Poupar</span>
                  <span className="font-semibold text-green-600">€{plan.disposable.monthly.toFixed(0)} ({plan.savings.rate.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-3">
                  <div 
                    className="bg-green-500 h-3 rounded"
                    style={{width: `${(plan.disposable.monthly / plan.income.averageMonthly) * 100}%`}}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-4 print-section">
          <h3 className="font-bold text-xl mb-3">🎯 Plano de Ação para 2026</h3>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3 text-lg">1.</span>
              <div>
                <span className="font-semibold">Criar Sistema de Poupança Automática</span>
                <p className="text-sm text-gray-700">Abrir conta poupança separada e configurar transferência automática no dia do ordenado</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3 text-lg">2.</span>
              <div>
                <span className="font-semibold">Tracking de Despesas</span>
                <p className="text-sm text-gray-700">Usar apps como Boonzi, Wallet ou Toshl para acompanhar gastos mensalmente</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3 text-lg">3.</span>
              <div>
                <span className="font-semibold">Revisão Mensal</span>
                <p className="text-sm text-gray-700">No último domingo de cada mês, rever despesas e ajustar plano</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3 text-lg">4.</span>
              <div>
                <span className="font-semibold">Usar Subsídios Sabiamente</span>
                <p className="text-sm text-gray-700">Planear com antecedência como usar Subsídio de Férias (Julho) e Natal (Novembro)</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3 text-lg">5.</span>
              <div>
                <span className="font-semibold">Otimizar Contratos</span>
                <p className="text-sm text-gray-700">Rever seguros, telecomunicações, energia - comparar ofertas a cada 6 meses</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Resources */}
        <div className="bg-gray-50 border rounded-lg p-4 print-section">
          <h3 className="font-bold text-lg mb-3">📚 Recursos Úteis em Portugal</h3>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Certificados de Aforro:</strong> Poupança garantida pelo Estado (~2.5-3%/ano)</li>
            <li>• <strong>Apps tracking:</strong> Boonzi, Wallet, Toshl Finance</li>
            <li>• <strong>Comparadores:</strong> Comparaja.pt (seguros, energia), Deco Proteste</li>
            <li>• <strong>Educação financeira:</strong> Blog do Banco de Portugal, Dr. Finanças</li>
            <li>• <strong>Apoio dívidas:</strong> DECO, gabinetes apoio sobreendividados</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8">
        {step < 6 && (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-3 mx-1 rounded-full transition-all ${
                      s <= step ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center font-medium">Passo {step} de 5</p>
            </div>

            {/* Steps */}
            <div className="min-h-[500px]">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t-2 no-print">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
              >
                ← Anterior
              </button>
              
              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Próximo →
                </button>
              ) : (
                <button
                  onClick={calculatePlan}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 font-bold transition-all shadow-lg hover:shadow-xl text-lg"
                >
                  🎯 Gerar Plano 2026
                </button>
              )}
            </div>
          </>
        )}

        {step === 6 && (
          <>
            {renderPlan()}
            <div className="mt-8 flex justify-center gap-4 no-print">
              <button
                onClick={() => {setStep(1); setPlan(null);}}
                className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 font-semibold transition-all"
              >
                🔄 Recomeçar
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 font-semibold transition-all"
              >
                🖨️ Imprimir Plano
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="text-center mt-6 text-sm text-gray-500 no-print">
        <p>Feito com ❤️ para famílias portuguesas | 2026</p>
      </div>
    </div>
  );
};

export default PortugalFinancePlanner2026;
