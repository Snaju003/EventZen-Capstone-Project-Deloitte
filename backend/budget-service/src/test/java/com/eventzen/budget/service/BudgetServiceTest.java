package com.eventzen.budget.service;

import com.eventzen.budget.dto.BudgetSummaryResponse;
import com.eventzen.budget.exception.AccessDeniedException;
import com.eventzen.budget.model.EventAccessSnapshot;
import com.eventzen.budget.model.EventBudget;
import com.eventzen.budget.repository.EventBudgetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private EventBudgetRepository eventBudgetRepository;

    @Mock
    private EventAccessClient eventAccessClient;

    @InjectMocks
    private BudgetService budgetService;

    @Test
    void vendorCannotReadBudgetForUnownedEvent() {
        EventAccessSnapshot event = new EventAccessSnapshot();
        event.setContractVersion("v1");
        event.setEventId("event-1");
        event.setCreatedBy("vendor-owner");
        event.setApprovedVendorUserId("approved-vendor");

        EventBudget budget = EventBudget.builder()
                .eventId("event-1")
                .totalBudget(BigDecimal.valueOf(10000))
                .spent(BigDecimal.valueOf(1500))
                .expenses(new ArrayList<>())
                .build();

        when(eventAccessClient.getEventAccessSnapshot("event-1")).thenReturn(Optional.of(event));
        assertThrows(
                AccessDeniedException.class,
                () -> budgetService.getBudgetSummary("event-1", "random-vendor", "vendor")
        );
    }

    @Test
    void ownerVendorCanReadOwnBudget() {
        EventAccessSnapshot event = new EventAccessSnapshot();
        event.setContractVersion("v1");
        event.setEventId("event-2");
        event.setCreatedBy("vendor-owner");
        event.setApprovedVendorUserId("another-vendor");

        EventBudget budget = EventBudget.builder()
                .eventId("event-2")
                .totalBudget(BigDecimal.valueOf(5000))
                .spent(BigDecimal.valueOf(800))
                .expenses(new ArrayList<>())
                .build();

        when(eventAccessClient.getEventAccessSnapshot("event-2")).thenReturn(Optional.of(event));
        when(eventBudgetRepository.findById("event-2")).thenReturn(Optional.of(budget));

        BudgetSummaryResponse summary = budgetService.getBudgetSummary("event-2", "vendor-owner", "vendor");

        assertEquals(BigDecimal.valueOf(5000), summary.getTotalBudget());
        assertEquals(BigDecimal.valueOf(800), summary.getSpent());
        assertEquals(BigDecimal.valueOf(4200), summary.getRemaining());
    }

    @Test
    void approvedVendorCanReadBudget() {
        EventAccessSnapshot event = new EventAccessSnapshot();
        event.setContractVersion("v1");
        event.setEventId("event-3");
        event.setCreatedBy("vendor-owner");
        event.setApprovedVendorUserId("approved-vendor");

        EventBudget budget = EventBudget.builder()
                .eventId("event-3")
                .totalBudget(BigDecimal.valueOf(9000))
                .spent(BigDecimal.valueOf(1000))
                .expenses(new ArrayList<>())
                .build();

        when(eventAccessClient.getEventAccessSnapshot("event-3")).thenReturn(Optional.of(event));
        when(eventBudgetRepository.findById("event-3")).thenReturn(Optional.of(budget));

        BudgetSummaryResponse summary = budgetService.getBudgetSummary("event-3", "approved-vendor", "vendor");

        assertEquals(BigDecimal.valueOf(8000), summary.getRemaining());
    }
}
